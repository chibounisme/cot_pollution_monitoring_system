const IdentityChecker = require('./authentication/identity.checker');
const Authenticator = require('./authentication/authentication.handler');
const Validator = require('./authorization/authorization.validation');
const config = require('../main/env.config');

exports.routesConfig = function (app) {
    app.post('/auth', [
        IdentityChecker.isPasswordAndUserMatch,
        Authenticator.login
    ]);

    app.post('/auth/refresh', [
        Validator.validJWTNeeded,
        Authenticator.refresh_token
    ]);
};