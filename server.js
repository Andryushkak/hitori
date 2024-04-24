const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const database = require('./DataBase');
const cors = require('cors');

const app = express();
app.use(cors({
origin: ['https://markus-it.azurewebsites.net', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type','Application/json'],
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

// Parsing POST request data


// Middleware for serving static files
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

// Route handler for the main page
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



// Set the port for the server
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});
