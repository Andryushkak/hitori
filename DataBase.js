// DataBase.js
const sql = require("mssql");
const dotenv = require("dotenv");
dotenv.config();

const config = {
  user: "andryushka",
  password: "gensy[eqkj#2022",
  server: "hitori.database.windows.net",
  database: "mydb",
  options: {
    encrypt: true
  }
};

async function pool() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to the database');
    return pool;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

async function registerUser(first_name, last_name, email, password) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("first_name", sql.NVarChar(50), first_name); // Виправлено назву функції
    request.input("last_name", sql.NVarChar(50), last_name); // Виправлено назву функції
    request.input("email", sql.NVarChar(200), email); // Виправлено назву функції
    request.input("password", sql.NVarChar(500), password); // Виправлено назву функції
    const result = await request.query(`
      INSERT INTO [user] (first_name, last_name, email, password)  -- "user" є зарезервованим ключовим словом в SQL, тому ми використовуємо його у квадратних дужках
      VALUES (@first_name, @last_name, @email, @password);
    `);
    console.log('User registered successfully');
    return result.rowsAffected;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("email", sql.NVarChar(200), email); // Виправлено назву функції
    request.input("password", sql.NVarChar(500), password); // Виправлено назву функції
    const result = await request.query(`
      SELECT * FROM [user] WHERE email = @email AND password = @password;  -- "user" є зарезервованим ключовим словом в SQL, тому ми використовуємо його у квадратних дужках
    `);
    if (result.recordset.length === 0) {
      console.log('User not found or incorrect password');
      return null;
    }
    const user = result.recordset[0];
    console.log('User logged in successfully');
    return user;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser
};
