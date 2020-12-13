const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/userModel');
const store = require('store');

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
                    username: store.get('id'),
                    email: email.emails[0].value,
                    first_name: email.name.givenName,
                    last_name: email.name.familyName,
                    level: 1
                }

                try {
                    let user = await User.findOne({ email: email.emails[0].value });
                    let usernamecheck = await User.findOne({ username: store.get('id') });
                    if(store.get('type')== "register" && usernamecheck){
                        store.clearAll();
                        return done(null, false, { message: 'Username already exists.' });
                    }                   
                    if (user) {
                      if(store.get('type')=='register'){
                          store.clearAll();
                          return done(null,false,{ message: 'User already registered.' });
                      }  
                      done(null, user);
                    } else {
                      if(store.get('type')!='register'){
                        store.clearAll();
                        return done(null, false, { message: 'User NOT Registered.' });
                      }  
                      user = await User.create(newUser);
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