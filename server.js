require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const language = require('./middleware/language');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  console.warn('\n[WARNING] SESSION_SECRET not set in .env — using insecure default.\n');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'pureva-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8, httpOnly: true, sameSite: 'lax' }
}));

// Language middleware — sets req.lang, res.locals.lang, res.locals.t, res.locals.ui, res.locals.tList
app.use(language);

app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

app.use((req, res) => {
  const content = require('./lib/store').readContent();
  res.status(404).render('404', { content });
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).send('Something went wrong. Check the server logs.');
});

app.listen(PORT, () => {
  console.log(`\nPureva running at http://localhost:${PORT}`);
  console.log(`Admin panel:   http://localhost:${PORT}/admin\n`);
});
