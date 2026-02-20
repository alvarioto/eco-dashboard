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
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
}));

// Configurar el parser de formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave-secreta',
    resave: false,
    saveUninitialized: true
}));

// Middleware para proteger rutas
function checkSession(req, res, next) {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }
    next();
}

// Configurar directorios estáticos
app.use('/js', express.static(path.join(__dirname, 'src', 'assets', 'js')));
app.use('/scss', express.static(path.join(__dirname, 'src', 'assets', 'scss')));
app.use('/statics', express.static(path.join(__dirname, 'src', 'assets', 'statics')));
app.use(express.static(path.join(__dirname, 'src')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// *** INICIO: Conexión a MySQL (Pool) ***
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1990',
    database: process.env.DB_NAME || 'login_system',
    port: process.env.DB_PORT || 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
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
    res.sendFile(path.join(__dirname, 'src', 'auth-login.html'));
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
                return res.json({ success: true, message: 'Login correcto' });
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
        return res.status(500).json({ error: 'Error al guardar el cálculo.' });
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

app.get('/session-check', (req, res) => {
    if (req.session.loggedin) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.status(500).send('No se pudo cerrar la sesión.');
        } else {
            res.redirect('/login');
        }
    });
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
