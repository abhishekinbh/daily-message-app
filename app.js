const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const compression = require('compression');
const csrf = require('csurf');
const path = require('path');
require('dotenv').config();

const { pool } = require('./lib/db');
const publicRoutes = require('./routes/public');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy for cPanel Passenger
app.set('trust proxy', 1);

// Helmet for security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

// Compression
app.use(compression());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions in MySQL
const sessionStore = new MySQLStore(
  {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  },
  pool
);

app.use(
  session({
    key: 'session_id',
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// CSRF protection
const csrfProtection = csrf({ cookie: false });

// Pass BASE_PATH and user info to all views
app.use((req, res, next) => {
  res.locals.basePath = BASE_PATH;
  res.locals.user = req.session.user || null;
  res.locals.isLoggedIn = !!req.session.user;
  next();
});

// Static files
app.use(`${BASE_PATH}/static`, express.static(path.join(__dirname, 'public')));

// One-time setup route
app.get(`${BASE_PATH}/setup`, async (req, res) => {
  try {
    const { query } = require('./lib/db');
    const [result] = await query('SELECT setting_value FROM system_settings WHERE setting_key = ?', ['setup_completed']);
    
    if (result && result.length > 0 && result[0].setting_value === 'true') {
      return res.status(403).send('Setup has already been run.');
    }

    const setupToken = process.env.SETUP_TOKEN || 'change-this-setup-token';
    if (req.query.token !== setupToken) {
      return res.status(403).send('Invalid setup token.');
    }

    // Run setup
    const fs = require('fs');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const statements = schemaSql
      .split(/;\s*\n+/)
      .map((part) => part.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await query(statement + ';');
    }

    const bcrypt = require('bcryptjs');
    const username = (process.env.ADMIN_USER || 'admin').trim();
    const password = process.env.ADMIN_PASS || 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const [existing] = await query('SELECT id FROM admin_users WHERE username = ? LIMIT 1', [username]);
    if (!existing || existing.length === 0) {
      await query('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
    }

    await query('UPDATE system_settings SET setting_value = ? WHERE setting_key = ?', ['true', 'setup_completed']);

    res.send('Setup completed successfully. You can now login at /admin/login.');
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).send(`Setup error: ${error.message}`);
  }
});

// Routes
app.use(BASE_PATH, publicRoutes);
app.use(`${BASE_PATH}/api`, apiRoutes);
app.use(`${BASE_PATH}/admin`, adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Error',
    message: NODE_ENV === 'production' ? 'An error occurred.' : err.message,
  });
});

// Listen
app.listen(PORT, () => {
  console.log(`App running on port ${PORT} (BASE_PATH: ${BASE_PATH || '/'}), environment: ${NODE_ENV}`);
});
