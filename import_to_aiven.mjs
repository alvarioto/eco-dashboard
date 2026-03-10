/**
 * import_to_aiven.mjs
 * 
 * Imports all data from import_data.sql into the Aiven MySQL database
 * using the same connection config as app.js (reads env vars).
 * 
 * Run: node import_to_aiven.mjs
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1990',
    database: process.env.DB_NAME || 'login_system',
    port: parseInt(process.env.DB_PORT) || 3307,
    waitForConnections: true,
    connectionLimit: 5,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true  // needed to run the full SQL file
});

async function run() {
    console.log('📡 Conectando a la base de datos...');
    const conn = await pool.getConnection();
    console.log('✅ Conectado correctamente.');

    // Read the SQL file
    const sql = fs.readFileSync('./import_data.sql', 'utf8');

    // Split by statement (handle both ; endings)
    // We'll execute each INSERT block separately
    const statements = sql
        .split('\n')
        .join(' ')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 5 && (
            s.toUpperCase().startsWith('INSERT') ||
            s.toUpperCase().startsWith('CREATE TABLE') ||
            s.toUpperCase().startsWith('DROP TABLE') ||
            s.toUpperCase().startsWith('LOCK') ||
            s.toUpperCase().startsWith('UNLOCK') ||
            s.toUpperCase().startsWith('ALTER TABLE') ||
            s.toUpperCase().startsWith('SET')
        ));

    console.log(`📋 ${statements.length} sentencias encontradas en import_data.sql`);

    let ok = 0, skip = 0;
    for (const stmt of statements) {
        try {
            await conn.query(stmt);
            ok++;
        } catch (err) {
            // Skip lock/unlock errors and duplicate key errors gracefully
            if (err.code === 'ER_DUP_ENTRY' || stmt.toUpperCase().startsWith('LOCK') || stmt.toUpperCase().startsWith('UNLOCK')) {
                skip++;
            } else {
                console.warn(`⚠️  Error en: ${stmt.substring(0, 80)}...`);
                console.warn(`   → ${err.message}`);
                skip++;
            }
        }
    }

    conn.release();
    await pool.end();

    console.log(`\n🎉 Importación completada: ${ok} sentencias OK, ${skip} omitidas.`);

    // Quick verify
    const conn2 = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '1990',
        database: process.env.DB_NAME || 'login_system',
        port: parseInt(process.env.DB_PORT) || 3307,
        ssl: { rejectUnauthorized: false }
    });

    const [rows] = await conn2.query('SELECT COUNT(*) as total FROM detallescomercializadoras');
    console.log(`📊 detallescomercializadoras: ${rows[0].total} registros`);
    const [rows2] = await conn2.query('SELECT COUNT(*) as total FROM datosvehiculosymaquinaria');
    console.log(`📊 datosvehiculosymaquinaria: ${rows2[0].total} registros`);
    const [rows3] = await conn2.query('SELECT COUNT(*) as total FROM detallesemisionesfugitivas');
    console.log(`📊 detallesemisionesfugitivas: ${rows3[0].total} registros`);

    await conn2.end();
}

run().catch(err => {
    console.error('❌ Error fatal:', err.message);
    process.exit(1);
});
