const User = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const keys = require('../config/keys');

sgMail.setApiKey(keys.sendGridAPIKey);



router.post("/register", (req, res) => {
    async function createUser() {
        User.findOne({
            username: req.body.username.toLowerCase()
        }).then(
            user => {
                if (user) {
                    return res.json({
                        error: "User already present"
                    });
                } else {
                    const body = {
                        username: req.body.username.toLowerCase(),
                        password: req.body.password,
                        name: req.body.name
                    };
                    const user = new User(body);
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(user.password, salt, (err, hash) => {
                            if (err) throw err;
                            user.password = hash;
                            user
                                .save()
                                .then(user => res.json(user))
                                .catch(err => console.log(err));
                        });
                    });
                }
            }
        ).catch(err => res.json(err));
    }
    createUser();
});
router.post("/login", (req, res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    User
        .findOne({
            username: username
        })
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                    const payload = {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        type: 'user'
                    };
                    jwt.sign(
                        payload,
                        keys.secretOrKey, {
                            expiresIn: 3600
                        },
                        (err, token) => {
                            res.json({
                                success: true,
                                token: `Bearer ${token}`
                            });
                        }
                    );
                } else {
                    return res.status(400).json({
                        password: "Password Incorrect"
                    });
                }
            });
        }).catch(err => res.json(err));
});


router.post('/forgotpassword', (req,res) => {
    User.findOne({username:req.body.username})
    .then(user => {
        const verificationCode = Math.floor(1000 + Math.random() * 9000);
        user.passwordResetToken = verificationCode;
        user.passwordResetTokenExpiresIn = Date.now() + 3600000;
        user.save()
            .then(user => res.send(user))
            .catch(error => res.send("An error occured"));
        const msg = {
            to: user.email,
            from: 'test@example.com',
            subject: 'Verification code for resetting password',
            text: 'Verification code is ' + verificationCode,
            html: '<strong>Verification code is '+verificationCode+'</strong>',
        };
        sgMail.send(msg).then(sent => console.log("Email sent")).catch(error => console.log("error occured"));   
    })
    .catch(error => res.send(error));
});

router.get('/reset/:username/:token', (req,res) => {
    res.send("Reset password page");
});

router.post('/reset/:username/:token', (req,res) => {
    User.findOne({username : req.params.username})
    .then(user => {
        if(!user) return res.json({"error":"Cannot reset password"});
        if(user.passwordResetToken === req.params.token && user.passwordResetTokenExpiresIn > Date.now()){
            if(req.body.password === req.body.confirm){
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    });
                });
                user.passwordResetToken = undefined;
                user.passwordResetTokenExpiresIn = undefined;
                const msg = {
                    to: user.email,
                    from: 'test@example.com',
                    subject: 'Confirmation mail for password reset',
                    text: 'This is a confirmation mail that your password has been changed successfully',
                    html: '<strong>Password changed successfully',
                };
                sgMail.send(msg).then(sent => console.log("Email sent")).catch(error => console.log("error occured"));
            } else {
                res.json({'error':'password do not match '});
            }
        } else {
            res.json({'error':'invalid token'});
        }
    })
})
module.exports = router;
