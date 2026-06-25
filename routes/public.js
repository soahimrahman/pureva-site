// routes/public.js
const express = require('express');
const router = express.Router();
const { readContent, update, genId } = require('../lib/store');
const { shade } = require('../lib/colorUtil');
const { getPricing } = require('../lib/productUtil');
const { isRateLimited } = require('../lib/rateLimiter');
const { isValidLanguage } = require('../lib/i18n');
const upload = require('../middleware/upload');
const { COOKIE_NAME } = require('../middleware/language');

function withPricing(products) {
  return products.map((p) => Object.assign({}, p, { pricing: getPricing(p) }));
}

router.get('/', (req, res) => {
  const content = readContent();
  const products = withPricing(content.products);
  const approvedReviews = content.reviews.filter((r) => r.status === 'approved');
  res.render('index', { content, products, approvedReviews, shade });
});

router.get('/product/:id', (req, res) => {
  const content = readContent();
  const product = content.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).render('404', { content });
  const productWithPricing = Object.assign({}, product, { pricing: getPricing(product) });
  const otherProducts = withPricing(content.products.filter((p) => p.id !== product.id)).slice(0, 3);
  res.render('product', { content, product: productWithPricing, otherProducts, shade });
});

// --- Language switch -------------------------------------------------------

router.get('/set-language/:code', (req, res) => {
  const code = req.params.code;
  if (isValidLanguage(code)) {
    res.cookie(COOKIE_NAME, code, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: false, sameSite: 'lax' });
  }
  const back = req.get('Referer') || '/';
  res.redirect(back);
});

// --- Customer review submission --------------------------------------------

router.post('/reviews/submit', upload.single('photo'), async (req, res) => {
  const ip = req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';

  // Honeypot — a hidden field real visitors never fill in. Bots that
  // auto-fill every input will trip it.
  if (req.body.website) {
    return res.redirect('/?reviewError=1#reviews');
  }

  if (isRateLimited(ip, { max: 3, windowMs: 60 * 60 * 1000 })) {
    return res.redirect('/?reviewError=ratelimit#reviews');
  }

  const name = (req.body.name || '').trim().slice(0, 80);
  const location = (req.body.location || '').trim().slice(0, 60);
  const quoteText = (req.body.quote || '').trim().slice(0, 600);
  const rating = Math.min(5, Math.max(1, parseInt(req.body.rating, 10) || 0));

  if (!name || !quoteText || !rating) {
    return res.redirect('/?reviewError=1#reviews');
  }

  const newReview = {
    id: genId('rev'),
    name,
    location,
    rating,
    quote: { en: quoteText, bn: quoteText }, // customer writes in one language; admin can edit/translate the other before approving
    photo: req.file ? '/uploads/' + req.file.filename : null,
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  await update((data) => {
    data.reviews.push(newReview);
  });

  res.redirect('/?reviewSubmitted=1#reviews');
});

module.exports = router;
