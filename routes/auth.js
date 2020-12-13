const express = require('express');
const passport = require('passport');
const router = express.Router();
const store = require('store');

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
    if(store.get('type') == 'register'){
        store.clearAll();
        res.redirect('/success');
    }
    else{
        req.session.email = req.user.email;
        req.session.level = req.user.level;
        req.session.save();
        store.clearAll();
        res.redirect('/play');
    }
  }
);

// @desc    Logout user
// @route   /auth/logout
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
});

module.exports = router;