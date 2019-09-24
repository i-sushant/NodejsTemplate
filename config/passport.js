const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");

const User = require('../models/user');
const Media = require('../models/media');

const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            if (jwt_payload.type === "user") {
                User.findById(jwt_payload.id)
                    .then(user => {
                        if (user) {
                            return done(null, user);
                        }
                        return done(null, false);
                    }).catch(err => console.log(err));     
            }
        })
    );
};
