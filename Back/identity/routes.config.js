const IdentityProvider = require('./controllers/identity.provider');
const AuthorizationPermission = require('../security/authorization/authorization.permission');

const passport = require('passport');

exports.routesConfig = function (app) {
    app.post('/users',
        [
            passport.authenticate('signUp', { session: false }),
            async (req, res, next) => {
                res.location('/users/' + req.user._id);
                res.status(201).send(req.user);
            }
        ]
    );

    app.post('/signup',
        [
            IdentityProvider.signUp
        ]
    );

    app.get('/users', [
        passport.authenticate('jwt', { session: false }, () => { }),
        AuthorizationPermission.minimumPermissionLevelRequired(Member),
        IdentityProvider.list
    ]);

    app.get('/users/:userId', [
        passport.authenticate('jwt', { session: false }, () => { }),
        AuthorizationPermission.minimumPermissionLevelRequired(Surfer),
        AuthorizationPermission.onlySameUserOrAdminCanDoThisAction,
        IdentityProvider.getById
    ]);

};