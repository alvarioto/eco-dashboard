const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const [res] = await pool.query('SELECT * FROM buildings');
        console.log('BUILDINGS:', JSON.stringify(res, null, 2));
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
run();
