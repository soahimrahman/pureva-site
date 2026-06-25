// lib/adminStore.js
//
// Admin login credentials live in their own file, separate from data/content.json,
// so that content CRUD operations can never accidentally touch auth data.
// This file is created by `npm run create-admin` — it does not exist (and the
// admin panel refuses to log in) until that script has been run once.

const fs = require('fs');
const path = require('path');

const ADMIN_PATH = path.join(__dirname, '..', 'data', 'admin.json');

function hasAdmin() {
  return fs.existsSync(ADMIN_PATH);
}

function readAdmin() {
  if (!hasAdmin()) return null;
  return JSON.parse(fs.readFileSync(ADMIN_PATH, 'utf-8'));
}

function writeAdmin({ username, passwordHash }) {
  fs.writeFileSync(
    ADMIN_PATH,
    JSON.stringify({ username, passwordHash }, null, 2),
    'utf-8'
  );
}

module.exports = { hasAdmin, readAdmin, writeAdmin };
