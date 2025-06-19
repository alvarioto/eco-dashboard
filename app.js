import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';


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
    secret: 'clave-secreta',
    resave: false,
    saveUninitialized: true
}));

// Middleware para proteger rutas
function checkSession(req, res, next) {
    if (!req.session.loggedin) {
        // Si NO está logueado, redirigimos al login
        return res.redirect('/login');
    }
    // Si sí está logueado, continúa
    next();
}

// Configurar directorios estáticos para los recursos de assets
app.use('/js', express.static(path.join(__dirname, 'src', 'assets', 'js')));
app.use('/scss', express.static(path.join(__dirname, 'src', 'assets', 'scss')));
app.use('/statics', express.static(path.join(__dirname, 'src', 'assets', 'statics')));
app.use(express.static(path.join(__dirname, 'src'))); // Añadido
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// *** INICIO: Conexión a MySQL ***
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1990',
    database: 'login_system',
    port: 3307
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos MySQL');
    }
});
// *** FIN: Conexión a MySQL ***

// Ruta inicial para probar el servidor
// La protegemos con checkSession: si no está logueado, va a /login.
app.get('/', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.post('/api/register', async (req, res) => {
    console.log('📩 Datos recibidos en /api/register:', req.body); // 👈 AÑADE ESTO

    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        console.log('❌ Faltan campos'); // 👈 AÑADE ESTO
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
    }

    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    db.query(checkQuery, [username, email], async (err, results) => {
        if (err) {
            console.error('❌ Error al verificar usuario:', err);
            return res.status(500).json({ success: false, message: 'Error del servidor.' });
        }

        console.log('🔍 Resultados de verificación:', results); // 👈 AÑADE ESTO

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'El nombre de usuario o email ya están registrados.' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('❌ Error al insertar usuario:', err);
                    return res.status(500).json({ success: false, message: 'Error al registrar el usuario.' });
                }

                console.log('✅ Usuario insertado con ID:', result.insertId); // 👈 AÑADE ESTO
                return res.status(201).json({ success: true, message: 'Usuario registrado con éxito.' });
            });
        } catch (error) {
            console.error('❌ Error al hashear:', error);
            return res.status(500).json({ success: false, message: 'Error al procesar la contraseña.' });
        }
    });
});



// Ruta para mostrar el formulario de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'auth-login.html'));
});

// Ruta para manejar el envío del formulario de login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Por favor, ingrese usuario y contraseña.');
    }

    const query = 'SELECT id, username FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            return res.status(500).send('Error del servidor.');
        }

        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.userId = results[0].id;
            req.session.username = results[0].username;
            // Devolvemos JSON en vez de redirigir
            return res.json({ success: true, message: 'Login correcto' });
        } else {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }
    });
});

// === CAMBIO: la ruta de guardar cálculo ahora es "/api/save-calculation" ===
app.post('/api/save-calculation', (req, res) => {
    const { type, concept, building, start_date, end_date, consumption, emissions } = req.body;
  
    // Convertir de "dd/mm/yyyy" a "yyyy-mm-dd":
    function toSQLDateFormat(d) {
      if (!d) return null;
      const [day, month, year] = d.split('/');
      return `${year}-${month}-${day}`;
    }
    const sqlStart = toSQLDateFormat(start_date);
    const sqlEnd   = toSQLDateFormat(end_date);
  
    // Verificar sesión
    if (!req.session.loggedin) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
  
    // Comprobar campos obligatorios
    if (!type || !sqlStart || !sqlEnd || !consumption || !emissions) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }
  
    const userId = req.session.userId;
  
    const query = `
      INSERT INTO calculations (user_id, type, concept, building, start_date, end_date, consumption, emissions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [userId, type, concept, building, sqlStart, sqlEnd, consumption, emissions], (err, result) => {
      if (err) {
        console.error('Error al guardar cálculo:', err);
        return res.status(500).json({ error: 'Error al guardar el cálculo.' });
      }
      return res.status(200).json({
        success: true,
        newId: result.insertId
      });
    });
  });

// === CAMBIO: get-calculations -> "/api/get-calculations" ===
app.get('/api/get-calculations', (req, res) => {
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

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener cálculos:', err);
            return res.status(500).json({ error: 'Error al obtener cálculos.' });
        }

        res.json(results);
    });
});

// Ruta protegida para verificar sesión
app.get('/session-check', (req, res) => {
    if (req.session.loggedin) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Ruta para cerrar sesión
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

// === CAMBIO: get-user-calculations -> "/api/get-user-calculations" ===
app.get('/api/get-user-calculations', (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
    }

    const userId = req.session.userId;

    const query = 'SELECT id, type, concept, building, start_date, end_date, consumption, emissions FROM calculations WHERE user_id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener cálculos:', err);
            return res.status(500).json({ success: false, error: 'Error al obtener cálculos.' });
        }

        res.status(200).json({ success: true, calculations: results });
    });
});

// Ruta DELETE sigue igual en "/api/delete-calculation/:id"
app.delete('/api/delete-calculation/:id', (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const calcId = req.params.id;
    const userId = req.session.userId;

    const query = 'DELETE FROM calculations WHERE id = ? AND user_id = ?';
    db.query(query, [calcId, userId], (err, result) => {
        if (err) {
            console.error('Error al eliminar cálculo:', err);
            return res.status(500).json({ error: 'Error al eliminar el cálculo.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cálculo no encontrado o no pertenece al usuario actual.' });
        }

        return res.json({ success: true });
    });
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});

// Manejador de rutas no encontradas para la API
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'Ruta de API no encontrada' });
});

app.use((req, res, next) => {
    console.log(`👉 [${req.method}] ${req.url}`);
    next();
});


// Nuevo endpoint para obtener los factores de emisión desde la tabla detallesinstalacionesfijas
app.get('/api/factores-emision', (req, res) => {
    // Consulta para obtener todos los registros de la tabla
    const query = 'SELECT * FROM detallesinstalacionesfijas';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los factores de emisión:', err);
            return res.status(500).json({ error: 'Error al obtener los factores de emisión.' });
        }
        // Se envían los resultados en formato JSON
        res.status(200).json({ success: true, factors: results });
    });
});

// Nuevo endpoint para obtener datos de detallescomercializadoras
app.get('/api/detalles-comercializadoras', (req, res) => {
    // Si requieres autenticación, puedes incluir también una verificación de sesión aquí
    // Por ejemplo: if (!req.session.loggedin) return res.status(401).json({ error: 'Usuario no autenticado.' }); detallesemisionesfugitivas

    const query = 'SELECT * FROM detallescomercializadoras';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener detalles comercializadoras:', err);
            return res.status(500).json({ error: 'Error al obtener los datos.' });
        }
        res.status(200).json({ success: true, data: results }); 
    });
});

// Nuevo endpoint para obtener datos de recarga de gas desde la tabla detallesemisionesfugitivas
app.get('/api/detalles-recarga-gas', (req, res) => {
    const query = 'SELECT * FROM detallesemisionesfugitivas'; // Usa el nombre exacto de tu tabla
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener detalles de recarga de gas:', err);
            return res.status(500).json({ error: 'Error al obtener los datos.' });
        }
        // Devuelve el resultado en formato JSON
        res.status(200).json({ success: true, data: results });
    });
});


// 👇 Aquí tienes tus cálculos
app.post('/api/save-calculation', (req, res) => { ... });
app.get('/api/get-calculations', (req, res) => { ... });

// 👇 AQUÍ puedes pegar el nuevo endpoint
app.post('/api/company-profile', (req, res) => {
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

  db.query(query, [
    userId, cif, nombre_empresa, razon_social, sector, actividad, direccion,
    ciudad, municipio, codigo_postal, empleados, facturacion, cantidad, tipo_actividad
  ], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar perfil de compañía:', err);
      return res.status(500).json({ success: false, message: 'Error al guardar los datos.' });
    }
    res.status(200).json({ success: true, newId: result.insertId });
  });
});





