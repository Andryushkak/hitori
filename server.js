const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const database = require('./DataBase');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const uploadPhotoToAzureStorage = require('./azureStorage');
const multer = require('multer');

require('./passport-setup');
const authRoutes = require('./auth-routes');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: '3d5879beae87657b4c944f7ee4da4886adc8cd5cb0c73b5675ce66d2773b3396',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(cors({
  origin: ['https://markus-it.azurewebsites.net', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Application/json'],
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id); // Зберігаємо лише ідентифікатор користувача у сесії
});

passport.deserializeUser(async (id, done) => {
  const user = await database.findUserById(id);
  done(null, user); // Повертаємо об'єкт користувача для використання в запитах
});


app.use('/', authRoutes);

const upload = multer();
app.post("/upload-photo", upload.single('photoData'), async (req, res, next) => {
  try {
    console.log(req.file); 
    if (!req.file) {
      return res.status(400).send('Немає завантаженого файлу');
    }

    const photoData = req.file.buffer.toString('base64');
    console.log(photoData); 
    console.log(typeof photoData);

    const { first_name, last_name } = req.body; 
    const photoName = `${first_name}_${last_name}`; 
    await uploadPhotoToAzureStorage(photoData, photoName);
    res.status(200).send('Фото успішно завантажено на Azure Blob Storage');
  } catch (error) {
    console.error("Помилка при завантаженні фото на сервер:", error);
    res.status(500).send('Помилка при завантаженні фото на сервер: ' + error.message);
  }
});


app.post("/register", async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  const result = await database.registerUser(first_name, last_name, email, password);
  if (result) {
    const user = { first_name, last_name, email };
    res.status(200).redirect('/profile'); // Редірект на сторінку профілю
  } else {
    res.status(500).send('Помилка реєстрації користувача');
  }
});

app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await database.loginUser(email, password);
  if (user) {
    const userData = { first_name: user.first_name, last_name: user.last_name, email: user.email };
    res.status(200).redirect('/profile'); // Редірект на сторінку профілю
  } else {
    res.status(401).send('Неправильний email або пароль');
  }
});


// Маршрут для відображення профілю користувача
app.get('/profile', async function(req, res) {
  try {
    const user = req.user || {}; // Зчитуємо дані користувача з сесії

    // Вивід користувача для перевірки
    console.log('User in profile route:', user);

    res.render('profile', { user }); // Передаємо дані користувача до шаблону
  } catch (error) {
    console.error('Error rendering profile:', error);
    res.status(500).send('Помилка відображення профілю користувача');
  }
});



app.use(express.static(path.join(__dirname, ''), {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  },
  fallthrough: false
}));

app.get('/', function(req, res) {
  const op = {
    root: path.join(__dirname, '')
  };
  const file = "/index.html";
  res.sendFile(file, op, function(err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});
