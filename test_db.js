import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function testConnection() {
    console.log('Testing connection to:', process.env.DB_HOST);
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '1990',
            database: process.env.DB_NAME || 'login_system',
            port: process.env.DB_PORT || 3307,
            ssl: { rejectUnauthorized: false }
        });

        const [rows] = await pool.query('SELECT id, username FROM users LIMIT 1');
        console.log('✅ Success! users table exists. First user:', rows);

        const [calcRows] = await pool.query('SELECT * FROM calculations LIMIT 1');
        console.log('✅ Success! calculations table exists.');

        pool.end();
    } catch (e) {
        console.error('❌ Connection or Query Error:', e.message);
    }
}

testConnection();
