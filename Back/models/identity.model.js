const Identity = require('mongoose').model('Identity');

exports.findByUsername = (username) => {
    Identity.findOne().byUsername(username).exec((err, identity) => {
        if(err){
            throw err;
        }
        return identity;
    });
}

exports.triggerLogin = (username, password) => {
    Identity.attemptAuthenticate(username, password, (err,identity,reason) => {
        if (err) throw err;
        // login was successful if we have an identity
        if (identity) {
            return identity;
        }
        // otherwise we can determine why we failed
        const reasons = Identity.failedLogin;
        switch (reason) {
            case reasons.NOT_FOUND:
            case reasons.PASSWORD_INCORRECT:
                throw new Error('Sign In failed');
            case reasons.MAX_ATTEMPTS:
                throw new Error('Account temporarily locked');
        }
    });
}

exports.findByEmail = (email) => {
    return Identity.find({email: email});
};

exports.findById = (id) => {
    return Identity.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createIdentity = (identityData) => {
    const identity = new Identity(identityData);
    return identity.save();
};