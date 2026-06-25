// lib/colorUtil.js
// Lightens (positive percent) or darkens (negative percent) a hex color.
// Used to turn one admin-picked "product color" into a two-stop gradient
// without asking a non-technical user to pick two colors per product.

function shade(hex, percent) {
  if (!hex) return '#3D6453';
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const num = parseInt(hex, 16);
  if (Number.isNaN(num)) return '#3D6453';

  const channels = [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff].map((c) => {
    const adjusted = percent < 0
      ? c * (1 + percent / 100)            // darken proportionally
      : c + (255 - c) * (percent / 100);   // lighten toward white
    return Math.max(Math.min(255, Math.round(adjusted)), 0);
  });

  return '#' + channels.map((c) => c.toString(16).padStart(2, '0')).join('');
}

module.exports = { shade };
