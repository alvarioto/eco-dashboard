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
        console.log('Validating buildings table schema...');
        // Create table if not exists (in case they don't have it yet)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS buildings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                property_type VARCHAR(100),
                address VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Adding user_id column...');
        await pool.query('ALTER TABLE buildings ADD COLUMN user_id INT DEFAULT NULL').catch(e => console.log('user_id info:', e.message));
        console.log('Done!');
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
patch();
