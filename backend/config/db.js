const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
<<<<<<< HEAD
  host: "localhost",
  user: "root",
  password: "python", 
  database: "blood_management"
=======
  uri: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
>>>>>>> c2eb11ffe546c69a8910a6e57eff758618a646f7
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to Railway MySQL database!");
  }
});