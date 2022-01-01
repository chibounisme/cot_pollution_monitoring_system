const IdentityModel = require("../../identity/models/identity.model");
const argon2 = require("argon2");
const { v4: uuidv4 } = require("uuid");
const validityTime =
  require("../../main/env.config.js").jwtValidityTimeInSeconds;

exports.isPasswordAndUserMatch = async (req, res, next) => {
  IdentityModel.findByEmail(req.body.email).then(async (user) => {
    if (!user[0]) {
      res.status(404).send({});
    } else {
      if (await argon2.verify(user[0].password, req.body.password)) {
        var now = Math.floor(Date.now() / 1000);
        req.body = {
          iss: "urn:pmscot.me",
          aud:
            "urn:" + (req.get("origin") ? req.get("origin") : "pmscot.me"),
          sub: user[0].email,
          name: user[0].firstName + " " + user[0].lastName,
          userId: user[0]._id,
          roles: user[0].permissionLevel,
          jti: uuidv4(),
          iat: now,
          exp: now + validityTime,
        };
        return next();
      } else {
        return res.status(400).send({ errors: ["Invalid e-mail or password"] });
      }
    }
  });
};