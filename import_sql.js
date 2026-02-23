import fs from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importDatabase() {
    console.log('Iniciando importación...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        multipleStatements: true,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const sqlPath = path.join(__dirname, 'import_data.sql');
        console.log('Leyendo archivo:', sqlPath);
        const sqlDump = fs.readFileSync(sqlPath, 'utf8');

        console.log('Ejecutando sentencias SQL en la nube de Aiven...');
        await connection.query(sqlDump);

        console.log('✅ ¡Importación masiva completada exitosamente! Todos tus datos antiguos y estructura han sido restaurados.');
    } catch (error) {
        console.error('❌ Error durante la importación:', error);
    } finally {
        await connection.end();
    }
}

importDatabase();
