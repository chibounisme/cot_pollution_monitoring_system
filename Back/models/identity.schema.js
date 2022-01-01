const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    argon2 = require('argon2');

const identitySchema = new Schema({
    firstname: String,
    lastname: String,
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

identitySchema.methods.grantPermission = (permission) => {
    this.permissions |= (1 << permission);
};

identitySchema.methods.checkPassword = async function (candidatePassword) {
    const identity = this;
    return await argon2.verify(identity.password, candidatePassword);
};

const Identity = mongoose.model('Identity', identitySchema);

exports.Identity = Identity;

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