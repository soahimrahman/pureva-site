#!/usr/bin/env node
// scripts/create-admin.js
//
// Run with: npm run create-admin
// Prompts for a username and password for the admin panel, hashes the
// password with bcrypt, and writes data/admin.json. Safe to re-run any time
// to change the password — it just overwrites the file.

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { writeAdmin } = require('../lib/adminStore');

function ask(question, { mask = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (mask) {
      // basic masking so the password isn't echoed in plain text
      rl._writeToOutput = (chunk) => {
        if (chunk.match(/[\r\n]/)) rl.output.write(chunk);
        else rl.output.write('*');
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      console.log('');
      resolve(answer.trim());
    });
  });
}

(async () => {
  console.log('\nPureva admin setup');
  console.log('-------------------');
  console.log('This creates (or replaces) the login for /admin.\n');

  const username = await ask('Admin username: ');
  if (!username) {
    console.log('Username cannot be empty. Run "npm run create-admin" again.');
    process.exit(1);
  }

  const password = await ask('Admin password (min 8 characters): ', { mask: true });
  if (!password || password.length < 8) {
    console.log('Password must be at least 8 characters. Run "npm run create-admin" again.');
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  writeAdmin({ username, passwordHash });

  console.log(`Admin account "${username}" saved to data/admin.json.`);
  console.log('You can now log in at /admin. Run this script again any time to change the password.\n');
})();
