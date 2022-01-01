const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    argon2 = require('argon2'),
    // these values can be whatever you want - we're defaulting to a
    // max of 5 attempts, resulting in a 2 hour lock
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 2 * 60 * 60 * 1000;

const identitySchema = new Schema({
    forename: String,
    surname: String,
    email: {type: String, lowercase:true, index: {unique: true},
            required: [true,'cannot be undefined'], match: [/\S+@\S+\.\S+/, 'is invalid']},
    username: { type: String, lowercase:true, index : {unique: true}, immutable: true,
                required: [true,'cannot be undefined'], match: [/^[a-zA-Z][a-zA-Z0-9_]+$/, 'is invalid']},
    password: {type: String, required: true},
    permissions: { type: Number, default: 0, min: 0, max: 2147483647 },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'identities'
});

identitySchema.virtual('fullName')
    .get( () => { return this.forename + ' ' + this.surname; })
    .set( (v) => {
        this.forename = v.substr(0, v.lastIndexOf(' '));
        this.surname = v.substr(v.lastIndexOf(' ') + 1)
    });

identitySchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

identitySchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    let updates = {$inc: {loginAttempts: 1}};
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.updateOne(updates, cb);
};

identitySchema.methods.grantPermission = (permission) => {
    this.permissions |= (1<<permission);
};


identitySchema.methods.revokePermission = (permission) => {
    this.permissions &= ~(1<<permission);
};

identitySchema.methods.hasPermission = (permission) => {
    return (this.permissions & (1<<permission) ) !== 0;
};

identitySchema.statics.persissionSet = {
    SURFER: 0, //Read Only Access To all the Cloud of Things Resources
    DEVICE_CONTROLLER: 7, //Update device configuration and send commands to devices
    MEMBER:15, //Create and Delete Devices from Registries
    MODERATOR: 22, //Read-Write access to all the Cloud of Things Resources excluding managing users
    MASTER:30 //Full Access To  all the Cloud of Things Resources including managing all users
};

const reasons = identitySchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

identitySchema.methods.checkPassword = async function(candidatePassword) {
    const identity = this;
    return await argon2.verify(identity.password, candidatePassword);
};

identitySchema.statics.attemptAuthenticate = function(username, password, cb) {
    this.findOne().byUsername(username).exec((err, identity) => {
        if (err) return cb(err);

        // make sure the identity exists
        if (!identity) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (identity.isLocked) {
            // just increment login attempts if account is already locked
            return identity.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }
        // check if the password is a match
        identity.checkPassword(password).then((isMatch) => {
            if(isMatch){
                // if there's no lock or failed attempts, just return the identity
                if (!identity.loginAttempts && !identity.lockUntil) return cb(null, identity);
                // reset attempts and lock info
                let updates = {
                    $set: {loginAttempts: 0},
                    $unset: {lockUntil: 1}
                };
                return identity.updateOne(updates, (err) => {
                    if (err) return cb(err);
                    return cb(null, identity);
                });
            }
            // password is incorrect, so increment login attempts before responding
            identity.incLoginAttempts((err) => {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        }).catch(() => {
            // password is incorrect, so increment login attempts before responding
            identity.incLoginAttempts((err) => {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};

identitySchema.query.byUsername = function (username) {
    return this.where({ username: new RegExp(username, 'i') } ); // 'i' flag to ignore case
};

mongoose.model('Identity', identitySchema);