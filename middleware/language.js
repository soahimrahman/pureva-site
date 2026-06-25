// middleware/language.js
const { readContent } = require('../lib/store');
const { t, tList, ui, isValidLanguage, DEFAULT_FALLBACK } = require('../lib/i18n');

const COOKIE_NAME = 'pureva_lang';

module.exports = function language(req, res, next) {
  let lang = req.cookies ? req.cookies[COOKIE_NAME] : null;

  if (!isValidLanguage(lang)) {
    let defaultLang = DEFAULT_FALLBACK;
    try {
      const content = readContent();
      if (isValidLanguage(content.settings && content.settings.defaultLanguage)) {
        defaultLang = content.settings.defaultLanguage;
      }
    } catch (e) {
      // content.json missing/unreadable — fall through to the hard default
    }
    lang = defaultLang;
  }

  req.lang = lang;
  res.locals.lang = lang;
  res.locals.t = (field) => t(field, lang);
  res.locals.tList = (field) => tList(field, lang);
  res.locals.ui = (key) => ui(key, lang);
  next();
};

module.exports.COOKIE_NAME = COOKIE_NAME;
