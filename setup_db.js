import fs from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createDatabaseAndImport() {
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

        console.log('Creando tabla de usuarios...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creando tabla de cálculos...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS calculations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                concept VARCHAR(100) NOT NULL,
                building VARCHAR(100) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                consumption FLOAT NOT NULL,
                emissions FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log('Añadiendo tablas de detalles del proyecto original (opcionales por ahora)...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS detallesinstalacionesfijas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                combustible VARCHAR(100),
                factor_emision FLOAT
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS detallescomercializadoras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100),
                factor_emision FLOAT
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS detallesemisionesfugitivas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                gas VARCHAR(100),
                pwp FLOAT
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS company (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                cif VARCHAR(50),
                nombre_empresa VARCHAR(150),
                razon_social VARCHAR(150),
                sector VARCHAR(100),
                actividad VARCHAR(150),
                direccion VARCHAR(255),
                ciudad VARCHAR(100),
                municipio VARCHAR(100),
                codigo_postal VARCHAR(20),
                empleados INT,
                facturacion FLOAT,
                cantidad FLOAT,
                tipo_actividad VARCHAR(100),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log('¡Base de datos y tablas creadas exitosamente!');

    } catch (error) {
        console.error('Error al crear la base de datos o tablas:', error);
    } finally {
        await connection.end();
    }
}

createDatabaseAndImport();
