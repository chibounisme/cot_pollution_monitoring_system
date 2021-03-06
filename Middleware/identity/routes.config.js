const IdentityProvider = require('./controllers/identity.provider');

exports.routesConfig = function (app) {
    app.post('/signup', IdentityProvider.signUp);

    app.get('/users/:userId', IdentityProvider.getById);
};