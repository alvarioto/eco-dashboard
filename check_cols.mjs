import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config();

const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1990',
    database: process.env.DB_NAME || 'login_system',
    port: parseInt(process.env.DB_PORT) || 3307,
    ssl: { rejectUnauthorized: false }
});

console.log('=== COLUMNAS detallesinstalacionesfijas ===');
const [cols1] = await conn.query('SHOW COLUMNS FROM detallesinstalacionesfijas');
console.log(cols1.map(c => c.Field).join(', '));

console.log('\n=== MUESTRA detallesinstalacionesfijas ===');
const [rows1] = await conn.query('SELECT * FROM detallesinstalacionesfijas LIMIT 3');
console.log(JSON.stringify(rows1, null, 2));

console.log('\n=== COLUMNAS detallesemisionesfugitivas ===');
const [cols2] = await conn.query('SHOW COLUMNS FROM detallesemisionesfugitivas');
console.log(cols2.map(c => c.Field).join(', '));

console.log('\n=== MUESTRA detallesemisionesfugitivas ===');
const [rows2] = await conn.query('SELECT * FROM detallesemisionesfugitivas LIMIT 5');
console.log(JSON.stringify(rows2, null, 2));

await conn.end();
