const config = require('../../main/env.config.js');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');
const { createHash } = require('crypto');
const IdentityModel = require('../../models/identity.schema');

const cert = config['cert-file'];

let challenges = {};
let codes = {};
let identities = {};

function addChallenge(codechallenge, clientId) {
    let signInId = clientId + "#" + uuidv4().toString();
    challenges[codechallenge] = signInId;

    return signInId;
}

function generateAuthorizationCode(signInId, identity) {
    let authorizationCode = uuidv4().toString();
    codes[signInId] = authorizationCode;
    identities[authorizationCode] = identity;
}

function generateTokenFor(identity) {
    let token = jwt.sign(identity, cert, { algorithm: 'RS512' });

    return token;
}

function checkCode(code, codeVerifier) {
    key = Buffer.from(createHash('sha265').update(codeVerifier).digest('hex')).toString('base64');
    if (challenges[key]) {
        if (codes[challenges[key]] == code) {
            delete codes[challenges[key]];
            delete challenges[key];

            let token = generateTokenFor(identities[code]);
            delete identities[code];
            return token;
        }
    }
    delete identities[code];
    return null;
}

function generateRefreshTokenFor(identity) {
    return generateTokenFor(identity);
}

exports.preSignIn = async (req, res) => {
    // presign token is in the format: base64(clientId:codeChallenge)
    try {
        let preAuthorizationHeader = Buffer.from(req.headers['Pre-Authorization'].split('Bearer ')[1], 'base64');
        let decodedTokenData = preAuthorizationHeader.split(':');
        let clientId = decodedTokenData[0];
        let codeChallenge = decodedTokenData[1];

        res.status(200).json({
            signInId: addChallenge(codeChallenge, clientId)
        });
    } catch (err) {

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

        let userIdentity = IdentityModel.Identity.findOne({
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

        let passwordMatch = await argon2.verify(userIdentity.password, req.body.password)

        if (!passwordMatch) {
            res.status(401).json({
                message: 'Wrong password'
            });
            return;
        }

        res.status(201).send({ authCode: token, generateAuthorizationCode(signInId, userIdentity) });
    } catch (err) {
        return next(err);
    }
};

exports.postSignIn = async (req, res) => {
    let postAuthorizationHeader = Buffer.from(req.headers['Post-Authorization'].split('Bearer ')[1], 'base64');
    let decodedTokenData = postAuthorizationHeader.split(':');
    let code = decodedTokenData[0];
    let codeVerifier = decodedTokenData[1];

    let token = checkCode(code, codeVerifier);
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

exports.refresh_token = (req, res) => {
    try {
        var now = Math.floor(Date.now() / 1000);
        req.body.iat = now;
        req.body.exp = now + config.jwtValidityTimeInSeconds;
        let token = jwt.sign(req.body, cert, { algorithm: 'RS512' });
        res.status(201).send({ access_token: token });
    } catch (err) {
        res.status(500).send({ errors: err });
    }
};