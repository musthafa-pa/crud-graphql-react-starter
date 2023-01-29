const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "testdb",
  password: "user123$",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const app = express();

app.listen(4000, () => {
  console.log(`App running at 4000`);
});
