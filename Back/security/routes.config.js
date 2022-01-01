const Authenticator = require('./authentication/authentication.handler');

exports.routesConfig = function (app) {
    app.post('/authorize', Authenticator.preSignIn);
    app.post('/authenticate', Authenticator.signIn);
    app.post('/oauth/token', Authenticator.postSignIn);
    app.post('/oauth/token/refresh', Authenticator.refresh_token);
};