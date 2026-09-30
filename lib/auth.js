const bcrypt = require('bcryptjs');
const { query } = require('./db');

async function login(username, password) {
  const [rows] = await query('SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1', [username]);
  if (!rows || rows.length === 0) return null;

  const user = rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;

  return { id: user.id, username: user.username };
}

async function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect(res.locals.basePath + '/admin/login');
  }
  next();
}

module.exports = { login, requireLogin };
