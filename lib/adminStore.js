// lib/adminStore.js

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const ADMIN_PATH = path.join(__dirname, '..', 'data', 'admin.json');

const ENV_ADMIN =
  process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD
    ? {
        username: process.env.ADMIN_USERNAME,
        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
      }
    : null;

function hasAdmin() {
  return !!ENV_ADMIN || fs.existsSync(ADMIN_PATH);
}

function readAdmin() {
  if (ENV_ADMIN) return ENV_ADMIN;

  if (!fs.existsSync(ADMIN_PATH)) return null;

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