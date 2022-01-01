const config = require('../../main/env.config.js');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');
const crypto = require('crypto');
const fs = require('fs');
const IdentityModel = require('../../models/identity.schema');

const cert = fs.readFileSync(config['key-file']);

let challenges = {};
let codes = {};
let identities = {};

function printPKCEData() {
    console.log('challenges: ' + JSON.stringify(challenges, null, 2));
    console.log('codes: ' + JSON.stringify(codes, null, 2));
    console.log('identities: ' + JSON.stringify(identities, null, 2));
}

function addChallenge(codechallenge, clientId) {
    let signInId = clientId + "#" + uuidv4().toString();
    challenges[codechallenge] = signInId;

    return signInId;
}

function generateAuthorizationCode(signInId, identity) {
    let authorizationCode = uuidv4().toString();
    codes[signInId] = authorizationCode;
    identities[authorizationCode] = identity;

    return authorizationCode;
}

function generateTokenFor(identity) {
    let token = jwt.sign({
        username: identity.username,
        email: identity.email,
        permissions: identity.permissions
    }, cert, { algorithm: 'RS512' });

    return token;
}

function checkCode(authCode, codeVerifier) {
    let hmac = crypto.createHmac('SHA256', config['SHA265_secret']);
    hmac.update(codeVerifier);
    let sha265String = hmac.digest('hex');
    key = Buffer.from(sha265String).toString('base64');

    printPKCEData();

    if (challenges[key]) {
        if (codes[challenges[key]] == authCode) {
            let token = generateTokenFor(identities[authCode]);
            
            delete codes[challenges[key]];
            delete challenges[key];
            delete identities[authCode];
            return token;
        }
    }
    delete identities[authCode];
    return null;
}

function generateRefreshTokenFor(identity) {
    return generateTokenFor(identity);
}

exports.preSignIn = async (req, res, next) => {
    // presign token is in the format: base64(clientId:codeChallenge)
    try {
        preAuthorization = req.headers['pre-authorization'];

        let preAuthorizationHeader = Buffer.from(preAuthorization.split('Bearer ')[1], 'base64').toString();
        let decodedTokenData = preAuthorizationHeader.split(':');
        let clientId = decodedTokenData[0];
        let codeChallenge = decodedTokenData[1];
        
        let signInId =  addChallenge(codeChallenge, clientId);

        res.status(200).json({
            signInId
        });
    } catch (err) {
        next(err);
    }
};

exports.signIn = async (req, res, next) => {
    try {
        let { username, password, signInId } = req.body;

        if (!(username && password && signInId)) {
            res.status(401).json({
                message: 'Missing required fields'
            });
            return;
        }

        let userIdentity = await IdentityModel.Identity.findOne({
            where: {
                username: req.body.username
            }
        });

        if (!userIdentity) {
            res.status(404).json({
                message: 'User with that username is not found'
            });
            return;
        }

        let passwordMatch = await argon2.verify(userIdentity.password, req.body.password);

        if (!passwordMatch) {
            res.status(401).json({
                message: 'Wrong password'
            });
            return;
        }

        let authCode =  generateAuthorizationCode(signInId, userIdentity);

        res.status(201).send({ authCode });
    } catch (err) {
        return next(err);
    }
};

exports.postSignIn = async (req, res, next) => {
    let postAuthorizationHeader = Buffer.from(req.headers['post-authorization'].split('Bearer ')[1], 'base64').toString();
    let decodedTokenData = postAuthorizationHeader.split(':');
    let authCode = decodedTokenData[0];
    let codeVerifier = decodedTokenData[1];

    let token = checkCode(authCode, codeVerifier);
    if (!token) {
        res.status(401).json({
            message: 'Failed Login'
        });
        return;
    }

    res.status(200).json({
        accessToken: token,
        refreshToken: generateRefreshTokenFor(token)
    });
};

exports.refreshToken = (req, res) => {
    try {
        var now = Math.floor(Date.now() / 1000);
        req.body.iat = now;
        req.body.exp = now + config.jwtValidityTimeInSeconds;
        let token = jwt.sign(req.body, { algorithm: 'RS512' });
        res.status(201).send({ access_token: token });
    } catch (err) {
        res.status(500).send({ errors: err });
    }
};