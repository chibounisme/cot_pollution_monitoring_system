const config = require('../../main/env.config.js');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');
const crypto = require('crypto');
const fs = require('fs');
const IdentityModel = require('../../models/identity.schema');

const hmacsha256 = require('crypto-js/hmac-sha256');
const Base64 = require('crypto-js/enc-base64');

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

function generateTokenFor(identity, isRefresh) {
    let token = jwt.sign({
        username: identity.username,
        email: identity.email,
        permissions: identity.permissions,
        id: identity.id
    }, cert, { algorithm: 'RS512', expiresIn: isRefresh ? '7d' : '1h' });

    return token;
}

function checkCode(authCode, codeVerifier) {
    let hmac = crypto.createHmac('SHA256', config['SHA265_secret']);
    hmac.update(codeVerifier);
    let sha256String = hmacsha256(codeVerifier, config['SHA265_secret']);
    let key = Base64.stringify(sha256String);

    if (challenges[key]) {
        if (codes[challenges[key]] == authCode) {
            let token = generateTokenFor(identities[authCode], false);

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
    return generateTokenFor(identity, true);
}

exports.preSignIn = async (req, res, next) => {
    // presign token is in the format: base64(clientId:codeChallenge)
    try {
        preAuthorization = req.headers['pre-authorization'];

        let preAuthorizationHeader = Buffer.from(preAuthorization.split('Bearer ')[1], 'base64').toString();
        let decodedTokenData = preAuthorizationHeader.split(':');
        let clientId = decodedTokenData[0];
        let codeChallenge = decodedTokenData[1];

        let signInId = addChallenge(codeChallenge, clientId);

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
                message: 'Wrong user/password combination'
            });
            return;
        }

        let authCode = generateAuthorizationCode(signInId, userIdentity);

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

    const accessTokenPayload = jwt.verify(token, cert, { algorithms: 'RS512' });

    let userIdentity = await IdentityModel.Identity.findById(accessTokenPayload.id);
    if (!userIdentity) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    res.status(200).json({
        accessToken: token,
        refreshToken: generateRefreshTokenFor(userIdentity)
    });
};

exports.refreshToken = async (req, res) => {
    try {
        const token = req.headers['authorization'].split('Bearer ')[1];

        const payload = jwt.verify(token, cert, { algorithms: 'RS512' });
        if (!payload) {
            res.status(402).json({
                message: 'Invalid JWT'
            });
            return;
        }

        let userIdentity = await IdentityModel.Identity.findById(payload.id);
        if (!userIdentity) {
            res.status(400).send({
                message: 'there was an error with getting the user data'
            });
            return;
        }

        let accessToken = generateTokenFor(userIdentity, false);

        res.status(200).send({ accessToken });
    } catch (err) {
        res.status(500).send({ errors: err });
    }
};