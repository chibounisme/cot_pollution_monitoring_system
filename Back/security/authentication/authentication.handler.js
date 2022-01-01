const config = require('../../main/env.config.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const cert = config['cert-file'];

exports.preSignIn = (req, res) => {

};

exports.signIn = (req, res) => {
    try {
        let refreshId = req.body.userId + config.refreshSecret + req.body.jti;
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
        let token = jwt.sign(req.body, cert, { algorithm: 'RS512' });
        let b = Buffer.from(hash);
        let refresh_token = salt + '$' + b.toString('base64');
        res.status(201).send({ accessToken: token, refreshToken: refresh_token });
    } catch (err) {
        res.status(500).send({ errors: err });
    }
};

exports.postSignIn = (req, res) => {

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