const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const database = require('../bace/DataBase');

passport.use(new GoogleStrategy({
    clientID: '617652204018-6sc96caa446ufmudadd2b6eb6ql6vkip.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
    // callbackURL: "https://markus-it.azurewebsites.net/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const existingUser = await database.findUserByEmail(profile.emails[0].value);
    if (existingUser) {

      return done(null, existingUser);

    } else {

      const newUser = await database.registerUser(profile.name.givenName, profile.name.familyName, profile.emails[0].value);
      return done(null, newUser);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id); 
});

passport.deserializeUser(async (id, done) => {
  const user = await database.findUserById(id);
  done(null, user);
});

