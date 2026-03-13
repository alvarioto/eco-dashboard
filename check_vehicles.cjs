const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql-desarrollo-circular-alvarioto-432a.i.aivencloud.com',
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || 'AVNS_KzO6sLzX0nU0t6lEDu9',
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT || 10328,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000
});

async function describeVehicles() {
    try {
        const [rows] = await pool.query("DESCRIBE vehicles");
        console.log('Vehicles Table Schema:');
        console.table(rows);
    } catch(e) {
        console.log('Error or table missing:', e.message);
    }
    process.exit(0);
}
describeVehicles();
