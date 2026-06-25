// lib/i18n.js
//
// Two kinds of bilingual text in this app:
//  1. Content fields from data/content.json — shaped like { en: "...", bn: "..." }
//     for any field an admin might want to translate. Pulled out with t().
//  2. Static UI chrome (button labels, carousel controls, form labels) that
//     isn't really "site content" an admin needs to edit — defined once here
//     in UI_STRINGS and pulled out with ui().
//
// Both fall back to the other language if one is missing, so a half-filled
// bilingual field never renders blank.

const SUPPORTED_LANGUAGES = ['en', 'bn'];
const DEFAULT_FALLBACK = 'en';

// Pull a string out of a { en, bn } object for the given language, falling
// back gracefully. Also tolerates plain strings (non-bilingual fields) and
// nullish values, so it's safe to call on anything.
function t(field, lang) {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    const primary = field[lang];
    if (primary !== undefined && primary !== null && primary !== '') return primary;
    const fallback = field[lang === 'en' ? 'bn' : 'en'];
    if (fallback !== undefined && fallback !== null) return fallback;
    return '';
  }
  return String(field);
}

// Same idea, but for { en: [...], bn: [...] } parallel-array fields
// (benefits, bullet points, trust lines). Falls back to the other language's
// array if the requested one is empty/missing.
function tList(field, lang) {
  if (!field) return [];
  if (Array.isArray(field)) return field; // already a plain list
  const primary = field[lang];
  if (Array.isArray(primary) && primary.length) return primary;
  const fallback = field[lang === 'en' ? 'bn' : 'en'];
  return Array.isArray(fallback) ? fallback : [];
}

function isValidLanguage(code) {
  return SUPPORTED_LANGUAGES.includes(code);
}

const UI_STRINGS = {
  orderNow: { en: 'Order Now', bn: 'অর্ডার করুন' },
  viewDetails: { en: 'View details', bn: 'বিস্তারিত দেখুন' },
  backToShop: { en: '← Back to shop', bn: '← শপে ফিরুন' },
  addToOrder: { en: 'Order this bar', bn: 'এই বারটি অর্ডার করুন' },
  keyIngredients: { en: 'Key ingredients', bn: 'প্রধান উপাদান' },
  whyThisBar: { en: 'Why this bar', bn: 'কেন এই বার' },
  benefits: { en: 'Benefits', bn: 'উপকারিতা' },
  rating: { en: 'Rating', bn: 'রেটিং' },
  saleEndsOn: { en: 'Offer ends', bn: 'অফার শেষ' },
  save: { en: 'Save', bn: 'সাশ্রয়' },
  shopAllBars: { en: 'Shop all bars', bn: 'সব বার দেখুন' },

  reviewsHeading: { en: 'What people are saying', bn: 'মানুষ যা বলছেন' },
  reviewsSub: { en: 'Real notes from customers — swipe or use the arrows to see more.', bn: 'গ্রাহকদের প্রকৃত মতামত — আরও দেখতে সোয়াইপ করুন বা তীর চিহ্নে ক্লিক করুন।' },
  shareYourReview: { en: 'Share your experience', bn: 'আপনার অভিজ্ঞতা জানান' },
  yourName: { en: 'Your name', bn: 'আপনার নাম' },
  yourLocation: { en: 'Your city (optional)', bn: 'আপনার শহর (ঐচ্ছিক)' },
  yourRating: { en: 'Your rating', bn: 'আপনার রেটিং' },
  yourReview: { en: 'Your review', bn: 'আপনার রিভিউ' },
  yourPhoto: { en: 'Add a photo (optional)', bn: 'ছবি যুক্ত করুন (ঐচ্ছিক)' },
  submitReview: { en: 'Submit review', bn: 'রিভিউ জমা দিন' },
  writeAReview: { en: 'Write a review', bn: 'রিভিউ লিখুন' },
  reviewThanksTitle: { en: 'Thank you!', bn: 'ধন্যবাদ!' },
  reviewThanksBody: {
    en: 'Your review has been submitted and will appear on the site once it\u2019s approved.',
    bn: 'আপনার রিভিউ জমা হয়েছে এবং অনুমোদনের পর সাইটে দেখা যাবে।'
  },
  reviewErrorBody: { en: 'Something went wrong submitting your review — please try again.', bn: 'রিভিউ জমা দিতে সমস্যা হয়েছে — আবার চেষ্টা করুন।' },
  closeForm: { en: 'Close', bn: 'বন্ধ করুন' },

  prevReview: { en: 'Previous review', bn: 'আগের রিভিউ' },
  nextReview: { en: 'Next review', bn: 'পরের রিভিউ' },
  pauseCarousel: { en: 'Pause autoplay', bn: 'অটোপ্লে বন্ধ করুন' },
  playCarousel: { en: 'Resume autoplay', bn: 'অটোপ্লে চালু করুন' },

  language: { en: 'EN', bn: 'বাং' }
};

function ui(key, lang) {
  const entry = UI_STRINGS[key];
  if (!entry) return '';
  return t(entry, lang);
}

module.exports = { t, tList, ui, isValidLanguage, SUPPORTED_LANGUAGES, DEFAULT_FALLBACK, UI_STRINGS };
