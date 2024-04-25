const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const database = require('./DataBase');

passport.use(new GoogleStrategy({
    clientID: '617652204018-6sc96caa446ufmudadd2b6eb6ql6vkip.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "https://markus-it.azurewebsites.net/auth/google/callback"
    
  },
  async (accessToken, refreshToken, profile, done) => {
    // Перевіряємо, чи користувач вже існує в базі даних
    const existingUser = await database.findUserByEmail(profile.emails[0].value);
    if (existingUser) {
      // Якщо користувач існує, просто повертаємо його дані
      return done(null, existingUser);
    } else {
      // Якщо користувач не існує, реєструємо його в базі даних
      const name = profile.name.split(" ");
      const first_name = name[0];
      const last_name = name.length > 1 ? name.slice(1).join(" ") : "";
      const newUser = await database.registerUser(first_name, last_name, profile.emails[0].value);
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

