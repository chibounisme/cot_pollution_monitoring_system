const Authenticator = require('./authentication/authentication.handler');

exports.routesConfig = function (app) {
    app.post('/preSignIn', Authenticator.preSignIn);
    app.post('/signin', Authenticator.signIn);
    app.post('/postSignIn', Authenticator.postSignIn);
    app.post('/auth/refresh', Authenticator.refresh_token);
};