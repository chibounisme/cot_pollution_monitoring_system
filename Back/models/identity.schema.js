const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    argon2 = require('argon2');

const identitySchema = new Schema({
    forename: String,
    surname: String,
    email: {
        type: String, lowercase: true, index: { unique: true },
        required: [true, 'cannot be undefined'], match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    username: {
        type: String, lowercase: true, index: { unique: true }, immutable: true,
        required: [true, 'cannot be undefined'], match: [/^[a-zA-Z][a-zA-Z0-9_]+$/, 'is invalid']
    },
    password: { type: String, required: true },
    permissions: { type: Number, default: 0, min: 0, max: 2147483647 }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'identities'
});

identitySchema.virtual('fullName')
    .get(() => { return this.forename + ' ' + this.surname; })
    .set((v) => {
        this.forename = v.substr(0, v.lastIndexOf(' '));
        this.surname = v.substr(v.lastIndexOf(' ') + 1)
    });

identitySchema.methods.grantPermission = (permission) => {
    this.permissions |= (1 << permission);
};


identitySchema.methods.revokePermission = (permission) => {
    this.permissions &= ~(1 << permission);
};

identitySchema.methods.hasPermission = (permission) => {
    return (this.permissions & (1 << permission)) !== 0;
};

identitySchema.statics.persissionSet = {
    SURFER: 0, //Read Only Access To all the Cloud of Things Resources
    DEVICE_CONTROLLER: 7, //Update device configuration and send commands to devices
    MEMBER: 15, //Create and Delete Devices from Registries
    MODERATOR: 22, //Read-Write access to all the Cloud of Things Resources excluding managing users
    MASTER: 30 //Full Access To  all the Cloud of Things Resources including managing all users
};

const reasons = identitySchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

identitySchema.methods.checkPassword = async function (candidatePassword) {
    const identity = this;
    return await argon2.verify(identity.password, candidatePassword);
};

identitySchema.statics.attemptAuthenticate = function (username, password, cb) {
    this.findOne().byUsername(username).exec((err, identity) => {
        if (err) return cb(err);

        // make sure the identity exists
        if (!identity) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the password is a match
        identity.checkPassword(password).then((isMatch) => {
            if (isMatch) {
                return identity.updateOne(updates, (err) => {
                    if (err) return cb(err);
                    return cb(null, identity);
                });
            }
            return cb(null, null, reasons.PASSWORD_INCORRECT);
        }).catch(() => {
            return cb(null, null, reasons.PASSWORD_INCORRECT);
        });
    });
};

identitySchema.query.byUsername = function (username) {
    return this.where({ username: new RegExp(username, 'i') }); // 'i' flag to ignore case
};

const Identity = mongoose.model('Identity', identitySchema);

exports.findByUsername = (username) => {
    Identity.findOne().byUsername(username).exec((err, identity) => {
        if (err) {
            throw err;
        }
        return identity;
    });
}

exports.triggerLogin = (username, password) => {
    Identity.attemptAuthenticate(username, password, (err, identity, reason) => {
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
    return Identity.find({ email: email });
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