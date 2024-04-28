const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const database = require('./DataBase');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const uploadPhotoToAzureStorage = require('./azureStorage'); // Включення файла з функцією для завантаження на Azure Storage
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

require('./passport-setup');
const authRoutes = require('./auth-routes');
const app = express();

app.use(session({
  secret: '3d5879beae87657b4c944f7ee4da4886adc8cd5cb0c73b5675ce66d2773b3396',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(cors({
  origin: ['https://markus-it.azurewebsites.net', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type','Application/json'],
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);

app.post("/upload-photo", async (req, res, next) => {
  const { photoData, photoName } = req.body; // Припускаючи, що дані фото передаються в запиті
  try {
    // Викликати функцію для завантаження фото на Azure Blob Storage
    await uploadPhotoToAzureStorage(photoData, photoName);
    res.status(200).send('Фото успішно завантажено на Azure Blob Storage');
  } catch (error) {
    res.status(500).send('Помилка при завантаженні фото на Azure Blob Storage');
  }
});

// Route handler for registration request
app.post("/register", async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  const result = await database.registerUser(first_name, last_name, email, password);
  if (result) {
    res.redirect('/hello.html');
  } else {
    res.status(500).send('Помилка реєстрації користувача');
  }
});

// Route handler for login request
app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await database.loginUser(email, password);
  if (user) {
    res.status(200).send('Користувач увійшов в систему успішно');
  } else {
    res.status(401).send('Неправильний email або пароль');
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
