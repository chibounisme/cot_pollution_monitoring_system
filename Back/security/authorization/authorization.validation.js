const jwt = require('jsonwebtoken'),
    fs = require('fs');

const cert = fs.readFileSync('/etc/letsencrypt/live/pmscot.me/fullchain.pem');

exports.validJWTNeeded = (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send();
            } else {
                var aud = 'urn:'+(req.get('origin')?req.get('origin'):"pmscot.me");
                req.jwt = jwt.verify(authorization[1], cert, {issuer:"urn:pmscot.me",audience:aud,algorithms: ['RS512']});
                return next();
            }
        } catch (err) {
            return res.status(403).send();
        }
    } else {
        return res.status(401).send();
    }
};