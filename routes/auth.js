const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google',
 passport.authenticate('google', { scope: ['profile','email'] })
 );

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/failure', failureFlash: true }),
  (req, res) => {
        if(req.user.username == ""){
          res.redirect('/register');
        }
        else{
          req.session.type = 'login';
          res.redirect('/home');
        }
    }
);

// @desc    Logout user
// @route   /auth/logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;