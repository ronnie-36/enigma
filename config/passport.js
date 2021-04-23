const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/userModel');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback',
                failureFlash: true 
            },
            async (accessToken, refreshToken, email, done) => {
                const newUser ={
                    googleId: email.id,
                    email: email.emails[0].value,
                    username: "",
                    first_name: email.name.givenName,
                    last_name: email.name.familyName,
                    score: 0,
                    level: [1,2]
                }

                try {
                    let user = await User.findOne({ email: email.emails[0].value });                 
                    if (user) {  
                      done(null, user);
                    } 
                    else {
                        user=await User.create(newUser);
                        done(null, user);
                    }
                  } catch (err) {
                    console.error(err);
                }
            }
        )
    )

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
}