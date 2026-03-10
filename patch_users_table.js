import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function patch() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding full_name and phone columns...');
        await pool.query('ALTER TABLE users ADD COLUMN full_name VARCHAR(255) DEFAULT NULL').catch(e => console.log('full_name info:', e.message));
        await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL').catch(e => console.log('phone info:', e.message));
        console.log('Done!');
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
patch();
