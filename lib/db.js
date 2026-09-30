const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'daily_messages',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(sql, values) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(sql, values);
    return [result];
  } finally {
    connection.release();
  }
}

module.exports = { pool, query };
