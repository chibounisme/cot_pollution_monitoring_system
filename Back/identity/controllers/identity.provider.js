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

        req.body.password = await argon2.hash(req.body.password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            hashLength: 64,
            saltLength: 32,
            timeCost: 11,
            parallelism: 2
        });

        if (!req.body.permissions)
            req.body.permissions = 0;

        const saved = await IdentityModel.createIdentity(req.body);
        res.status(201).send({ id: saved._id });
    } catch (err) {
        return next(err);
    }
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    IdentityModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getById = (req, res) => {
    const token = req.headers['authorization'].split('Bearer ')[1];
    console.log(token);
    console.log(req.headers);

    const secretKey = fs.readFileSync(config['key-file']);
    const x = jwt.verify(token, secretKey);
    console.log(x);

    IdentityModel.findById(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};