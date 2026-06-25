// lib/store.js
//
// Tiny JSON-file "database" for site content. Chosen deliberately over a real
// database engine: this site has exactly one editor (the shop owner via the
// admin panel), low write volume, and needs to run on whatever cheap hosting
// is available without native module compilation (no better-sqlite3/postgres
// driver headaches on shared hosting). If this ever grows into something with
// many concurrent editors or relational data, swap this module out for a real
// database — every route calls through here, so that's the only file to change.

const fs = require('fs');
const path = require('path');

const CONTENT_PATH = path.join(__dirname, '..', 'data', 'content.json');

// Simple in-process write queue so two saves in quick succession can't
// interleave and corrupt the file.
let writeChain = Promise.resolve();

function readContent() {
  const raw = fs.readFileSync(CONTENT_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeContent(data) {
  writeChain = writeChain.then(() => new Promise((resolve, reject) => {
    const tmpPath = CONTENT_PATH + '.tmp';
    fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8', (err) => {
      if (err) return reject(err);
      fs.rename(tmpPath, CONTENT_PATH, (err2) => {
        if (err2) return reject(err2);
        resolve();
      });
    });
  }));
  return writeChain;
}

function update(mutatorFn) {
  const data = readContent();
  mutatorFn(data);
  return writeContent(data).then(() => data);
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

module.exports = { readContent, writeContent, update, genId };
