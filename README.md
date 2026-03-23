# Eco Dashboard - Calculadora de Huella de Carbono

Plataforma web para la gestión y cálculo de la huella de carbono de organizaciones. Permite gestionar edificios, vehículos, empleados y realizar cálculos de emisiones según los estándares de Alcance 1, 2 y 3.

## 🚀 Características

- **Gestión de Edificios**: Registro y administración de instalaciones
- **Gestión de Flota Vehicular**: Control de vehículos y consumos
- **Cálculo de Emisiones**: 
  - Alcance 1: Combustión en instalaciones fijas
  - Alcance 2: Consumo eléctrico (mix de comercializadoras)
  - Alcance 3: Emisiones fugitivas y otros factores
- **Dashboard Visual**: Gráficos y estadísticas de emisiones
- **Modo Oscuro**: Interfaz adaptada para ambos temas

## 🛠️ Tecnologías

- **Backend**: Express.js + MySQL
- **Frontend**: Bootstrap 5 + Vanilla JS
- **Build**: Vite
- **Base de Datos**: MySQL (Aiven Cloud)

## 📋 Requisitos

- Node.js 18+
- MySQL 8.0+

## ⚡ Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos
# Importar import_data.sql en MySQL

# Ejecutar migración de contraseñas (solo una vez)
node migrate_passwords.cjs

# Iniciar servidor
node app.js
```

## 🔧 Configuración

Crear archivo `.env` con las variables de entorno:

```env
DB_HOST=mysql-host
DB_USER=root
DB_PASSWORD=password
DB_NAME=login_system
DB_PORT=3306
SESSION_SECRET=your-secret-key
```

## 📖 Uso

1. Acceder a `http://localhost:3000/auth-login.html`
2. Iniciar sesión con credenciales de usuario
3. Navegar por las secciones:
   - **Dashboard**: Resumen de emisiones
   - **Edificios**: Gestión de instalaciones
   - **Vehículos**: Gestión de flota
   - **Emisiones**: Cálculo de huella de carbono
   - **Compañía**: Configuración empresarial

## 📁 Estructura

```
eco-dashboard/
├── app.js              # Servidor Express
├── vite.config.js      # Configuración Vite
├── package.json        # Dependencias
├── src/                # Código fuente
│   ├── *.html          # Páginas
│   ├── calculohuella.js
│   └── assets/         # Estilos y scripts
├── dist/               # Build de producción
└── import_data.sql     # Esquema de base de datos
```

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Rate limiting en APIs
- Validación de inputs con Joi
- Sesiones con cookies httpOnly

## 📄 Licencia

MIT