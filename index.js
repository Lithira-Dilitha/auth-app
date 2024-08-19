const express = require("express");
const app = express();
const port = 3000;
const {Pool} = require("pg");
require('dotenv').config();

const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASS,
    port:process.env.BD_PORT
});
app.listen(port, () =>
  console.log(`Server is Running on http://localhost:${port}`)
);