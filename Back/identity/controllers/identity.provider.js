const IdentityModel = require('../../models/identity.schema');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const config = require('../../main/env.config');
const fs = require('fs');

exports.signUp = async (req, res, next) => {
    if (req.body == {} || !(req.body.username && req.body.email && req.body.password && req.body.firstname && req.body.lastname)) {
        res.status(400).send({
            message: 'Missing required fields'
        });
        return;
    }

    try {
        let existsWithEmailOrUsername = await IdentityModel.Identity.find().or([{ email: { $eq: req.body.email } }, { username: { $eq: req.body.username } }]);

        if (existsWithEmailOrUsername.length) {
            res.status(401).send({
                message: 'User with email or username already exists!'
            });
            return;
        }

        req.body.password = await argon2.hash(req.body.password);

        if (!req.body.permissions)
            req.body.permissions = 0;

        const saved = await IdentityModel.createIdentity(req.body);
        res.status(201).send({ id: saved._id });
    } catch (err) {
        return next(err);
    }
};

exports.getById = async (req, res) => {
    const token = req.headers['authorization'].split('Bearer ')[1];

    const secretKey = fs.readFileSync(config['key-file']);
    const payload = jwt.verify(token, secretKey, { algorithms: 'RS512' });
    if (!payload) {
        res.status(402).json({
            message: 'Invalid JWT'
        });
        return;
    }

    if (payload.id != req.params.userId) {
        res.status(401).send({
            message: 'Cannot get other people\'s information'
        });
        return;
    }

    result = await IdentityModel.Identity.findById(req.params.userId);
    if(!result) {
        res.status(400).send({
            message: 'there was an error with getting the user data'
        });
        return;
    }

    delete result.password;

    res.status(200).send(JSON.stringify(result));
};