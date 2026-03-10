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

console.log('=== DETALLESINSTALACIONESFIJAS (combustibles fijos) ===');
const [r1] = await conn.query('SELECT COUNT(*) as total, MIN(Año) as min_year, MAX(Año) as max_year FROM detallesinstalacionesfijas');
console.log(r1[0]);
const [r1b] = await conn.query('SELECT DISTINCT Nombre FROM detallesinstalacionesfijas LIMIT 20');
console.log('Combustibles:', r1b.map(r => r.Nombre).join(', '));

console.log('\n=== DATOSVEHICULOSYMAQUINARIA ===');
const [r2] = await conn.query('SELECT COUNT(*) as total, MIN(año) as min_year, MAX(año) as max_year FROM datosvehiculosymaquinaria');
console.log(r2[0]);
const [r2b] = await conn.query('SELECT DISTINCT Combustible FROM datosvehiculosymaquinaria LIMIT 20');
console.log('Combustibles:', r2b.map(r => r.Combustible).join(', '));

console.log('\n=== DETALLESCOMERCIALIZADORAS ===');
const [r3] = await conn.query('SELECT COUNT(*) as total FROM detallescomercializadoras');
console.log(r3[0]);
const [r3b] = await conn.query('SELECT Comercializadora, CO2ekWh FROM detallescomercializadoras WHERE Comercializadora LIKE "%ADEINNOVA%" LIMIT 5');
console.log('ADEINNOVA:', r3b);

console.log('\n=== DETALLESEMISIONESFUGITIVAS ===');
const [r4] = await conn.query('SELECT COUNT(*) as total FROM detallesemisionesfugitivas');
console.log(r4[0]);
const [r4b] = await conn.query('SELECT DISTINCT Nombre FROM detallesemisionesfugitivas LIMIT 10');
console.log('Gases:', r4b.map(r => r.Nombre).join(', '));

await conn.end();
