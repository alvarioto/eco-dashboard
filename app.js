import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Configuración de path para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar CORS
const allowedOrigins = [
    'http://localhost:5173', 'http://localhost:5174', 
    'http://localhost:3000', 'http://127.0.0.1:3000'
];
app.use(cors({
    origin: function(origin, callback) {
        if(!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS Error'));
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// Configurar el parser de formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave-secreta',
    resave: false,
    saveUninitialized: false, // Changed to false to prevent empty sessions
    cookie: {
        secure: false, // false for local HTTP
        httpOnly: true,
        sameSite: 'lax', // allow cross-navigate
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));


// Middleware para proteger rutas
function checkSession(req, res, next) {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }
    next();
}

// Configurar directorios estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// *** INICIO: Conexión a MySQL (Pool) ***
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1990',
    database: process.env.DB_NAME || 'login_system',
    port: process.env.DB_PORT || 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
});

// Verificar conexión inicial
pool.getConnection()
    .then(conn => {
        console.log('✅ Conectado a la base de datos MySQL');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a la base de datos:', err.message);
    });
// *** FIN: Conexión a MySQL ***

// Ruta inicial
app.get('/', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.post('/api/register', async (req, res) => {
    console.log('📩 Datos recibidos en /api/register:', req.body);
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        console.log('❌ Faltan campos');
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
    }

    try {
        const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
        const [results] = await pool.query(checkQuery, [username, email]);

        console.log('🔍 Resultados de verificación:', results);

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'El nombre de usuario o email ya están registrados.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const [insertResult] = await pool.query(insertQuery, [username, email, hashedPassword]);

        console.log('✅ Usuario insertado con ID:', insertResult.insertId);
        return res.status(201).json({ success: true, message: 'Usuario registrado con éxito.' });
    } catch (error) {
        console.error('❌ Error en el registro:', error);
        return res.status(500).json({ success: false, message: 'Error del servidor al registrarse.' });
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'auth-login.html'));
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Por favor, ingrese usuario y contraseña.');
    }

    try {
        const query = 'SELECT id, username, password FROM users WHERE username = ?';
        const [results] = await pool.query(query, [username]);

        if (results.length > 0) {
            const user = results[0];

            // Verificamos si la contraseña coincide (vía hash, o directamente si estaba en plano antes)
            const match = await bcrypt.compare(password, user.password).catch(() => false);
            const isPlaintextMatch = (password === user.password);

            if (match || isPlaintextMatch) {
                req.session.loggedin = true;
                req.session.userId = user.id;
                req.session.username = user.username;
                
                return req.session.save(err => {
                    if (err) {
                        console.error('Error guardando sesión:', err);
                        return res.status(500).json({ success: false, message: 'Error interno de sesión.' });
                    }
                    return res.json({ success: true, message: 'Login correcto' });
                });
            }
        }

        return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });

    } catch (err) {
        console.error('Error al iniciar sesión:', err.message);
        return res.status(500).send('Error del servidor.');
    }
});

app.post('/api/save-calculation', async (req, res) => {
    const { type, concept, building, start_date, end_date, consumption, emissions } = req.body;

    function toSQLDateFormat(d) {
        if (!d) return null;
        const [day, month, year] = d.split('/');
        return `${year}-${month}-${day}`;
    }
    const sqlStart = toSQLDateFormat(start_date);
    const sqlEnd = toSQLDateFormat(end_date);

    if (!req.session.loggedin) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    if (!type || !sqlStart || !sqlEnd || !consumption || !emissions) {
        return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const userId = req.session.userId;
    const query = `
      INSERT INTO calculations (user_id, type, concept, building, start_date, end_date, consumption, emissions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.query(query, [userId, type, concept, building, sqlStart, sqlEnd, consumption, emissions]);
        return res.status(200).json({ success: true, newId: result.insertId });
    } catch (err) {
        console.error('Error al guardar cálculo:', err);
        return res.status(500).json({ error: 'Error del servidor al guardar.' });
    }
});

app.get('/api/get-user-buildings', checkSession, async (req, res) => {
    try {
        const userId = req.session.userId;
        const [buildings] = await pool.query('SELECT * FROM buildings WHERE user_id = ? OR user_id IS NULL ORDER BY name ASC', [userId]);
        res.json({ success: true, buildings });
    } catch (err) {
        console.error('Error fetching buildings:', err);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
});

app.post('/api/add-building', checkSession, async (req, res) => {
    const { name, property_type, address } = req.body;
    const userId = req.session.userId;

    if (!name) {
        return res.status(400).json({ success: false, message: 'El nombre del edificio es obligatorio.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO buildings (user_id, nombre, tipo_edificio, direccion) VALUES (?, ?, ?, ?)',
            [userId, name, property_type || '', address || '']
        );
        res.json({ success: true, newId: result.insertId, message: 'Edificio guardado.' });
    } catch (err) {
        console.error('Error añadiendo edificio en MySQL:', err);
        res.status(500).json({ success: false, message: 'La base de datos rechazó el registro.' });
    }
});

app.get('/api/get-calculations', async (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const userId = req.session.userId;
    const query = `
        SELECT type, concept, building, start_date, end_date, consumption, emissions
        FROM calculations
        WHERE user_id = ?
        ORDER BY start_date DESC
    `;

    try {
        const [results] = await pool.query(query, [userId]);
        res.json(results);
    } catch (err) {
        console.error('Error al obtener cálculos:', err);
        return res.status(500).json({ error: 'Error al obtener cálculos.' });
    }
});

app.get('/api/get-user-calculations', async (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
    }

    const userId = req.session.userId;
    const query = 'SELECT id, type, concept, building, start_date, end_date, consumption, emissions FROM calculations WHERE user_id = ?';

    try {
        const [results] = await pool.query(query, [userId]);
        res.status(200).json({ success: true, calculations: results });
    } catch (err) {
        console.error('Error al obtener cálculos:', err);
        return res.status(500).json({ success: false, error: 'Error al obtener cálculos.' });
    }
});

app.delete('/api/delete-calculation/:id', async (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const calcId = req.params.id;
    const userId = req.session.userId;

    const query = 'DELETE FROM calculations WHERE id = ? AND user_id = ?';

    try {
        const [result] = await pool.query(query, [calcId, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cálculo no encontrado o no pertenece al usuario actual.' });
        }
        return res.json({ success: true });
    } catch (err) {
        console.error('Error al eliminar cálculo:', err);
        return res.status(500).json({ error: 'Error al eliminar el cálculo.' });
    }
});

app.get('/api/session-check', (req, res) => {
    if (req.session.loggedin) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.status(500).send('No se pudo cerrar la sesión.');
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/api/get-user-profile', async (req, res) => {
    // DIAGNOSTIC FALLBACK: If session is completely missing, return a dummy user instead of 401
    if (!req.session || !req.session.loggedin || !req.session.userId) {
        console.warn("⚠️ [api/get-user-profile] SESIÓN NO ENCONTRADA O CADUCADA. Devolviendo usuario temporal.");
        return res.json({
            success: true,
            user: {
                id: 999,
                username: 'Usuario (Sin Sesión)',
                email: 'sesion@perdida',
                fullName: 'La cookie se borró o no llegó',
                phone: 'Revisa consola'
            },
            stats: { totalCalculos: 0, ultimoCalculo: null }
        });
    }

    const userId = req.session.userId;
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, full_name, phone FROM users WHERE id = ?', [userId]
        );
        const [calcStats] = await pool.query(
            'SELECT COUNT(*) as total, MAX(created_at) as lastCalc FROM calculations WHERE user_id = ?', [userId]
        );
        const user = users[0] || {};
        const stats = calcStats[0] || {};
        return res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username || req.session.username,
                email: user.email || '',
                fullName: user.full_name || '',
                phone: user.phone || ''
            },
            stats: {
                totalCalculos: stats.total || 0,
                ultimoCalculo: stats.lastCalc || null
            }
        });
    } catch (err) {
        console.error('Error al obtener perfil:', err);
        return res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
});

app.post('/api/update-user-profile', async (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ success: false, message: 'No autenticado.' });
    }
    const userId = req.session.userId;
    const { email, fullName, phone, newPassword } = req.body;
    try {
        // Update basic fields (add columns if they don't exist yet — safe with IF NOT EXISTS workaround)
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT NULL`).catch(() => {});
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT NULL`).catch(() => {});

        if (newPassword && newPassword.length >= 6) {
            const hashed = await bcrypt.hash(newPassword, 10);
            await pool.query(
                'UPDATE users SET email=?, full_name=?, phone=?, password=? WHERE id=?',
                [email, fullName, phone, hashed, userId]
            );
        } else {
            await pool.query(
                'UPDATE users SET email=?, full_name=?, phone=? WHERE id=?',
                [email, fullName, phone, userId]
            );
        }
        return res.json({ success: true, message: 'Perfil actualizado correctamente.' });
    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        return res.status(500).json({ success: false, message: 'Error al guardar los cambios.' });
    }
});

app.get('/api/factores-emision', async (req, res) => {
    const query = 'SELECT * FROM detallesinstalacionesfijas';

    try {
        const [results] = await pool.query(query);
        res.status(200).json({ success: true, factors: results });
    } catch (err) {
        console.error('Error al obtener los factores de emisión:', err);
        return res.status(500).json({ error: 'Error al obtener los factores de emisión.' });
    }
});

app.get('/api/detalles-comercializadoras', async (req, res) => {
    const query = 'SELECT * FROM detallescomercializadoras';
    try {
        const [results] = await pool.query(query);
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Error al obtener detalles comercializadoras:', err);
        return res.status(500).json({ error: 'Error al obtener los datos.' });
    }
});

app.get('/api/detalles-recarga-gas', async (req, res) => {
    const query = 'SELECT * FROM detallesemisionesfugitivas';
    try {
        const [results] = await pool.query(query);
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Error al obtener detalles de recarga de gas:', err);
        return res.status(500).json({ error: 'Error al obtener los datos.' });
    }
});

app.post('/api/company-profile', async (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
    }

    const userId = req.session.userId;
    const {
        cif, nombre_empresa, razon_social, sector, actividad,
        direccion, ciudad, municipio, codigo_postal,
        empleados, facturacion, cantidad, tipo_actividad
    } = req.body;

    const query = `
        INSERT INTO company
        (user_id, cif, nombre_empresa, razon_social, sector, actividad, direccion, ciudad, municipio, codigo_postal, empleados, facturacion, cantidad, tipo_actividad) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.query(query, [
            userId, cif, nombre_empresa, razon_social, sector, actividad, direccion,
            ciudad, municipio, codigo_postal, empleados, facturacion, cantidad, tipo_actividad
        ]);
        res.status(200).json({ success: true, newId: result.insertId });
    } catch (err) {
        console.error('❌ Error al guardar perfil de compañía:', err);
        return res.status(500).json({ success: false, message: 'Error al guardar los datos.' });
    }
});

app.get('/api/ver-tablas', async (req, res) => {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        let result = { mensaje: "¡Conexión exitosa a tu base de datos!", tablas: {} };

        for (let row of tables) {
            let tableName = Object.values(row)[0];
            const [tableData] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT 100`);
            result.tablas[tableName] = tableData;
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error al ver tablas:', err);
        res.status(500).json({ error: err.message });
    }
});

// Manejador de rutas no encontradas para la API
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'Ruta de API no encontrada' });
});

app.use((req, res, next) => {
    console.log(`👉 [${req.method}] ${req.url}`);
    next();
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
