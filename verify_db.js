import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function verify() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const tables = ['users', 'calculations', 'company', 'buildings', 'datosvehiculosymaquinaria'];
        console.log('--- Verificando registros en Aiven ---');
        for (const table of tables) {
            try {
                const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`Tabla '${table}': ${rows[0].count} registros.`);
            } catch (e) {
                console.log(`Tabla '${table}': ERROR (${e.message})`);
            }
        }
    } finally {
        await connection.end();
    }
}
verify();
