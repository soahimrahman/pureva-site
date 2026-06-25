// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const { readContent, update, genId } = require('../lib/store');
const { hasAdmin, readAdmin } = require('../lib/adminStore');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/upload');
const { SECTIONS } = require('../lib/sectionConfig');
const { SINGLE_SECTIONS } = require('../lib/singleSectionConfig');
const { getPricing } = require('../lib/productUtil');

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function parseListValue(raw) {
  return String(raw || '').split('\n').map(s => s.trim()).filter(Boolean);
}

function buildFromFields(fields, body, existing, uploadedFile) {
  const out = {};
  fields.forEach(f => {
    if (f.type === 'image') {
      if (uploadedFile) {
        out[f.key] = '/uploads/' + uploadedFile.filename;
      } else if (body[f.key + '__clear'] === 'on') {
        out[f.key] = null;
      } else {
        out[f.key] = existing ? existing[f.key] : null;
      }
      return;
    }
    if (f.type === 'number') {
      const v = body[f.key];
      out[f.key] = (v === undefined || v === '') ? (f.default ?? null) : Number(v);
      return;
    }
    if (f.type === 'list') {
      out[f.key] = parseListValue(body[f.key]);
      return;
    }
    // Bilingual field types
    if (f.type === 'bitext' || f.type === 'bitextarea') {
      out[f.key] = {
        en: String(body[f.key + '__en'] || '').trim(),
        bn: String(body[f.key + '__bn'] || '').trim(),
      };
      return;
    }
    if (f.type === 'bilist') {
      out[f.key] = {
        en: parseListValue(body[f.key + '__en']),
        bn: parseListValue(body[f.key + '__bn']),
      };
      return;
    }
    // plain text / select / color
    out[f.key] = body[f.key] !== undefined ? body[f.key] : (f.default ?? '');
  });
  return out;
}

function deleteOldImageIfLocal(imgPath) {
  if (!imgPath || !imgPath.startsWith('/uploads/')) return;
  const full = path.join(__dirname, '..', 'public', imgPath);
  fs.unlink(full, () => {});
}

function buildAdminNav() {
  const listLinks = Object.keys(SECTIONS).map(k => ({ label: SECTIONS[k].label, href: '/admin/' + k }));
  const pageLinks = Object.keys(SINGLE_SECTIONS).map(k => ({ label: SINGLE_SECTIONS[k].label, href: '/admin/page/' + k }));
  pageLinks.push({ label: 'Patch-test note', href: '/admin/page-patch-note' });
  return { listLinks, pageLinks };
}

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────

router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { error: null, needsSetup: !hasAdmin(), pageTitle: 'Login' });
});

router.post('/login', async (req, res) => {
  if (!hasAdmin()) {
    return res.render('admin/login', { error: 'No admin account exists yet. Run "npm run create-admin" first.', needsSetup: true, pageTitle: 'Login' });
  }
  const { username, password } = req.body;
  const admin = readAdmin();
  const ok = admin && username === admin.username && bcrypt.compareSync(password || '', admin.passwordHash);
  if (!ok) return res.render('admin/login', { error: 'Incorrect username or password.', needsSetup: false, pageTitle: 'Login' });
  req.session.isAdmin = true;
  req.session.username = username;
  res.redirect('/admin');
});

router.post('/logout', (req, res) => { req.session.destroy(() => res.redirect('/admin/login')); });

// ─────────────────────────────────────────────────────────────
// All routes below require auth
// ─────────────────────────────────────────────────────────────

router.use(requireAuth);
router.use((req, res, next) => {
  res.locals.adminNav = buildAdminNav();
  res.locals.currentPath = req.path;
  next();
});

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const content = readContent();
  const now = new Date();

  const totalProducts = (content.products || []).length;
  const pendingReviews = (content.reviews || []).filter(r => r.status === 'pending').length;
  const activeDiscounts = (content.products || []).filter(p => getPricing(p, now).onSale).length;

  const sectionCounts = Object.keys(SECTIONS).map(key => ({
    key, label: SECTIONS[key].label,
    count: (content[key] || []).length
  }));

  res.render('admin/dashboard', {
    content, sectionCounts,
    singleSections: SINGLE_SECTIONS,
    username: req.session.username,
    pageTitle: 'Dashboard',
    saved: req.query.saved || null,
    stats: { totalProducts, pendingReviews, activeDiscounts }
  });
});

// ─────────────────────────────────────────────────────────────
// Review approval queue
// ─────────────────────────────────────────────────────────────

router.get('/reviews-queue', (req, res) => {
  const content = readContent();
  const pending = (content.reviews || []).filter(r => r.status === 'pending');
  res.render('admin/reviews-queue', { pending, pageTitle: 'Review Queue', content });
});

router.post('/reviews-queue/:id/approve', async (req, res) => {
  await update(data => {
    const rev = (data.reviews || []).find(r => r.id === req.params.id);
    if (rev) rev.status = 'approved';
  });
  res.redirect('/admin/reviews-queue');
});

router.post('/reviews-queue/:id/reject', async (req, res) => {
  await update(data => {
    const rev = (data.reviews || []).find(r => r.id === req.params.id);
    if (rev) rev.status = 'rejected';
  });
  res.redirect('/admin/reviews-queue');
});

// ─────────────────────────────────────────────────────────────
// Generic list-section CRUD
// ─────────────────────────────────────────────────────────────

router.param('section', (req, res, next, key) => {
  const config = SECTIONS[key];
  if (!config) return res.status(404).send('Unknown section: ' + key);
  req.sectionKey = key;
  req.sectionConfig = config;
  next();
});

router.get('/:section', (req, res) => {
  const content = readContent();
  res.render('admin/list', {
    content, items: content[req.sectionKey] || [],
    sectionKey: req.sectionKey, config: req.sectionConfig,
    pageTitle: req.sectionConfig.label
  });
});

router.get('/:section/new', (req, res) => {
  res.render('admin/form', {
    sectionKey: req.sectionKey, config: req.sectionConfig,
    item: {}, isNew: true, error: null,
    pageTitle: 'Add ' + req.sectionConfig.singular
  });
});

router.post('/:section/new', upload.single('image'), async (req, res) => {
  try {
    const newItem = buildFromFields(req.sectionConfig.fields, req.body, {}, req.file);
    newItem.id = genId(req.sectionConfig.idPrefix);
    await update(data => { if (!data[req.sectionKey]) data[req.sectionKey] = []; data[req.sectionKey].push(newItem); });
    res.redirect('/admin/' + req.sectionKey);
  } catch (err) {
    res.status(400).render('admin/form', {
      sectionKey: req.sectionKey, config: req.sectionConfig,
      item: req.body, isNew: true, error: err.message || 'Save failed.',
      pageTitle: 'Add ' + req.sectionConfig.singular
    });
  }
});

router.get('/:section/:id/edit', (req, res) => {
  const content = readContent();
  const item = (content[req.sectionKey] || []).find(i => i.id === req.params.id);
  if (!item) return res.status(404).send('Item not found.');
  res.render('admin/form', {
    sectionKey: req.sectionKey, config: req.sectionConfig,
    item, isNew: false, error: null,
    pageTitle: 'Edit ' + req.sectionConfig.singular
  });
});

router.post('/:section/:id/edit', upload.single('image'), async (req, res) => {
  try {
    let oldImg = null, newImg = null;
    await update(data => {
      const arr = data[req.sectionKey] || [];
      const idx = arr.findIndex(i => i.id === req.params.id);
      if (idx === -1) throw new Error('Item not found.');
      oldImg = arr[idx].image;
      const updated = buildFromFields(req.sectionConfig.fields, req.body, arr[idx], req.file);
      updated.id = req.params.id;
      newImg = updated.image;
      arr[idx] = updated;
    });
    if (oldImg && oldImg !== newImg) deleteOldImageIfLocal(oldImg);
    res.redirect('/admin/' + req.sectionKey);
  } catch (err) {
    res.status(400).render('admin/form', {
      sectionKey: req.sectionKey, config: req.sectionConfig,
      item: { ...req.body, id: req.params.id }, isNew: false, error: err.message || 'Save failed.',
      pageTitle: 'Edit ' + req.sectionConfig.singular
    });
  }
});

router.post('/:section/:id/delete', async (req, res) => {
  let removedImg = null;
  await update(data => {
    const arr = data[req.sectionKey] || [];
    const idx = arr.findIndex(i => i.id === req.params.id);
    if (idx !== -1) { removedImg = arr[idx].image; arr.splice(idx, 1); }
  });
  if (removedImg) deleteOldImageIfLocal(removedImg);
  res.redirect('/admin/' + req.sectionKey);
});

// ─────────────────────────────────────────────────────────────
// Single-object sections
// ─────────────────────────────────────────────────────────────

router.get('/page/:key', (req, res) => {
  const key = req.params.key;
  const config = SINGLE_SECTIONS[key];
  if (!config) return res.status(404).send('Unknown section.');
  const content = readContent();
  res.render('admin/single-form', {
    sectionKey: key, config, item: content[key] || {}, error: null, pageTitle: config.label
  });
});

router.post('/page/:key', upload.single('image'), async (req, res) => {
  const key = req.params.key;
  const config = SINGLE_SECTIONS[key];
  if (!config) return res.status(404).send('Unknown section.');
  try {
    let oldImg = null, newImg = null;
    await update(data => {
      const imgField = config.fields.find(f => f.type === 'image');
      oldImg = imgField ? (data[key] || {})[imgField.key] : null;
      const updated = buildFromFields(config.fields, req.body, data[key] || {}, req.file);
      newImg = imgField ? updated[imgField.key] : null;
      data[key] = { ...data[key], ...updated };
    });
    if (oldImg && oldImg !== newImg) deleteOldImageIfLocal(oldImg);
    res.redirect('/admin?saved=' + key);
  } catch (err) {
    res.status(400).render('admin/single-form', {
      sectionKey: key, config, item: req.body, error: err.message || 'Save failed.', pageTitle: config.label
    });
  }
});

router.get('/page-patch-note', (req, res) => {
  const content = readContent();
  const note = content.patchTestNote;
  res.render('admin/patch-note', {
    valueEn: (note && note.en) || (typeof note === 'string' ? note : ''),
    valueBn: (note && note.bn) || '',
    pageTitle: 'Patch-test note'
  });
});

router.post('/page-patch-note', async (req, res) => {
  await update(data => {
    data.patchTestNote = { en: req.body.valueEn || '', bn: req.body.valueBn || '' };
  });
  res.redirect('/admin?saved=patchTestNote');
});

module.exports = router;
