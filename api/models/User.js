var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    facebookID: String,
    firebaseID: String,
    firstname: String,
    lastname: String,
    displayName: String,
    birthday: Date,
    gender: String,
    email: String,
    phone: String,
    avatar: String,
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() }
}, {
    versionKey: false
});

var User = mongoose.model('User', userSchema);

module.exports = User;