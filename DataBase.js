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
    const existingUser = await findUserByEmail(email); // Перевіряємо, чи вже є користувач з такою поштою
    if (existingUser) {
      console.log('Користувач з такою поштою вже існує');
      return false; // Повертаємо false, якщо користувач вже існує
    }

    const dbPool = await pool();
    const request = dbPool.request();
    request.input("first_name", sql.NVarChar(50), first_name);
    request.input("last_name", sql.NVarChar(50), last_name);
    request.input("email", sql.NVarChar(200), email);
    request.input("password", sql.NVarChar(500), password);
    const result = await request.query(`
      INSERT INTO [user] (first_name, last_name, email, password)
      VALUES (@first_name, @last_name, @email, @password);
    `);
    console.log('Користувач успішно зареєстрований');
    return true; // Повертаємо true, якщо користувача успішно зареєстровано
  } catch (error) {
    console.error('Помилка реєстрації користувача:', error);
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

async function registerGoogleUser(first_name, last_name, email) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("firstName", sql.NVarChar(50), first_name);
    request.input("lastName", sql.NVarChar(50), last_name);
    request.input("email", sql.NVarChar(200), email);
    const result = await request.query(`
      INSERT INTO [user] (first_name, last_name, email)
      VALUES (@firstName, @lastName, @email);
    `);
    console.log('Google user registered successfully');
    return result.rowsAffected;
  } catch (error) {
    console.error('Error registering Google user:', error);
    throw error;
  }
}

async function findUserById(id) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("id", sql.Int, id);
    const result = await request.query(`
      SELECT * FROM [user] WHERE id = @id;
    `);

    // Додано виведення значення id перед його використанням
    console.log('ID, переданий у запиті SQL:', id);

    if (result.recordset.length === 0) {
      console.log('User not found');
      return null;
    }
    const user = result.recordset[0];
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
}

async function findUserByEmail(email) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("email", sql.NVarChar(200), email);
    const result = await request.query(`
      SELECT * FROM [user] WHERE email = @email;
    `);
    if (result.recordset.length === 0) {
      console.log('User not found');
      return null;
    }
    const user = result.recordset[0];
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}



module.exports = {
  registerUser,
  loginUser,
  findUserById,
  registerGoogleUser,
  findUserByEmail

};
