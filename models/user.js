const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    email:String,
    passwordResetToken:String,
    passwordResetTokenExpiresIn:Date
});

const User = mongoose.model('User', userSchema);
module.exports = User;