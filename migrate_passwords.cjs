const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1990',
    database: process.env.DB_NAME || 'login_system',
    port: process.env.DB_PORT || 3307,
});

async function migratePasswords() {
    console.log('🔄 Iniciando migración de contraseñas...\n');

    try {
        const [users] = await pool.query('SELECT id, username, password FROM users');

        let migrated = 0;
        let alreadyHashed = 0;
        let errors = 0;

        for (const user of users) {
            const password = user.password;

            const isHashed = password.startsWith('$2') && password.length === 60;

            if (isHashed) {
                console.log(`⏭️  [${user.username}] Ya tiene hash bcrypt`);
                alreadyHashed++;
                continue;
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
                console.log(`✅ [${user.username}] Contraseña migrada a bcrypt`);
                migrated++;
            } catch (err) {
                console.error(`❌ [${user.username}] Error: ${err.message}`);
                errors++;
            }
        }

        console.log('\n📊 Resumen de migración:');
        console.log(`   ✅ Migradas: ${migrated}`);
        console.log(`   ⏭️  Ya hadhed: ${alreadyHashed}`);
        console.log(`   ❌ Errores: ${errors}`);
        console.log('\n🎉 Migración completada!');

    } catch (err) {
        console.error('❌ Error general:', err.message);
    } finally {
        pool.end();
    }
}

migratePasswords();
