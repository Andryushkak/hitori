const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const database = require('./DataBase');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
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

// Встановіть доступ до Azure Key Vault
async function getKeyVaultSecrets() {
    const credential = new DefaultAzureCredential();
    const keyVaultName = process.env["KEY_VAULT_NAME"];
    const url = "https://" + keyVaultName + ".vault.azure.net";
    const kvClient = new SecretClient(url, credential);

    // Встановіть імена секретів, що використовуються в вашому Key Vault
    const keySecretName = "key1";
    const endpointSecretName = "key2";

    // Отримайте значення секретів з Key Vault
    const retrievedKey = await (await kvClient.getSecret(keySecretName)).value;
    const retrievedEndpoint = await (await kvClient.getSecret(endpointSecretName)).value;

    return { key: retrievedKey, endpoint: retrievedEndpoint };
}

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
  
  // Отримайте значення секретів з Azure Key Vault після запуску сервера
  const { key, endpoint } = await getKeyVaultSecrets();
  console.log("Your secret key value is: ", key);
  console.log("Your secret endpoint value is: ", endpoint);
});
