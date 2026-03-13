const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDB() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ecodashboard',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("Checking columns...");
        // Handle renaming region -> municipio silently if it exists
        try {
            await pool.query('ALTER TABLE buildings CHANGE region municipio VARCHAR(255) NULL');
            console.log("Renamed region to municipio.");
        } catch(e) { console.log("region column might already be renamed or not exist:", e.message); }

        try {
            await pool.query('ALTER TABLE buildings CHANGE provincia codigo_postal VARCHAR(20) NULL');
            console.log("Renamed provincia to codigo_postal.");
        } catch(e) { console.log("provincia column might already be renamed or not exist:", e.message); }

    } catch (err) {
        console.error("General error:", err);
    } finally {
        await pool.end();
    }
}

updateDB();
