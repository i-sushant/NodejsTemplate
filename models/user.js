const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:String,
    name:String,
    email:{
        type:String, 
        required:true, 
        unique:true
    },
    passwordResetToken:String,
    passwordResetTokenExpiresIn:Date
});

const User = mongoose.model('User', userSchema);
module.exports = User;
