// lib/productUtil.js

function isSaleActive(product, now = new Date()) {
  if (!product.salePrice || Number(product.salePrice) <= 0) return false;
  const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD, avoids TZ edge cases
  if (product.saleStartDate && todayStr < product.saleStartDate) return false;
  if (product.saleEndDate && todayStr > product.saleEndDate) return false;
  return true;
}

// Returns the values templates need to render pricing/badges without
// duplicating the date-math everywhere.
function getPricing(product, now = new Date()) {
  const onSale = isSaleActive(product, now);
  const original = Number(product.price) || 0;
  const sale = onSale ? Number(product.salePrice) : null;
  const percentOff = onSale && original > 0 ? Math.round(((original - sale) / original) * 100) : 0;
  return {
    onSale,
    displayPrice: onSale ? sale : original,
    originalPrice: original,
    percentOff,
    saleEndDate: onSale ? product.saleEndDate : null
  };
}

module.exports = { isSaleActive, getPricing };
