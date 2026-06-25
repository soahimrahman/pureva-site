// lib/rateLimiter.js
//
// Minimal in-memory rate limiter. Resets if the server restarts, which is
// an acceptable tradeoff for a small site's review-spam protection — not
// meant to replace a real WAF, just to stop casual abuse of the public
// review form.

const hits = new Map(); // ip -> [timestamps]

function isRateLimited(ip, { max = 3, windowMs = 60 * 60 * 1000 } = {}) {
  const now = Date.now();
  const existing = (hits.get(ip) || []).filter((ts) => now - ts < windowMs);
  if (existing.length >= max) {
    hits.set(ip, existing);
    return true;
  }
  existing.push(now);
  hits.set(ip, existing);
  return false;
}

module.exports = { isRateLimited };
