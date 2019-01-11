const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../models/user');
const bcrypt = require ('bcryptjs');

module.exports = passport => {
    // Local Strategy
    passport.use(new LocalStrategy((username, password, done) => {
        // Match uswername
        let query = {username:username};

        userModel.findOne(query, (err, user) => {
            if (err) {
                throw err;
            }

            if (!user) {
                return done(null, false, {message: 'No user found'});
            }

            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    throw err;
                }

                if (isMatch) {
                    // Passwords match
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Incorrect password'});
                }
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done (null, user.id);
    });

    passport.deserializeUser((id, done) => {
        userModel.findById(id, (err, user) => {
            done(err, user);
        });
    });
};