const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);


router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Успішна автентифікація, перенаправлення на головну сторінку
    res.render('profile', { user: { first_name, last_name, email } });
  }
);

module.exports = router;
