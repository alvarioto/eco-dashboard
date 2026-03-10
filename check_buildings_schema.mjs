import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1990',
    database: process.env.DB_NAME || 'login_system',
    port: process.env.DB_PORT || 3307,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [rows] = await pool.query('DESCRIBE buildings');
    console.log("Buildings table schema:");
    console.table(rows);
  } catch(e) {
    console.error("DB Error:", e.message);
  } finally {
    pool.end();
  }
}
checkDb();
