// db.js
require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  query,
  pool,
};
