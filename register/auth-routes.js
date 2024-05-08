const express = require('express');
const passport = require('passport');
const router = express.Router();



router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);


router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    
    res.redirect('/profile');
  }
);


module.exports = router;
