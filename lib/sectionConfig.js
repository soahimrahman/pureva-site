// lib/sectionConfig.js — describes every array section in content.json.
// Field types: text, textarea, list, number, color, select, image,
//   bitext (bilingual text), bitextarea (bilingual textarea), bilist (bilingual list)
// Any 'bi*' type renders as side-by-side EN / BN inputs in the admin form.

const ICON_OPTIONS = [
  'icon-leaf','icon-shield','icon-droplet','icon-charcoal','icon-crown',
  'icon-sparkle','icon-milk','icon-sun','icon-seedling','icon-ban',
  'icon-flask','icon-truck','icon-heart-hand','icon-cart','icon-box','icon-eye'
];

const SECTIONS = {
  products: {
    label: 'Products', singular: 'Product', idPrefix: 'prod',
    listTitle: (item) => (item.name && item.name.en) || item.name || '(untitled)',
    listSubtitle: (item) => `৳${item.price}${item.salePrice ? ' → ৳' + item.salePrice : ''} · ${item.weight || ''}`,
    fields: [
      { key: 'name',    label: 'Name',                        type: 'bitext',    required: true },
      { key: 'weight',  label: 'Weight (e.g. 85g)',           type: 'text',      required: true },
      { key: 'price',   label: 'Regular price (৳)',           type: 'number',    required: true },
      { key: 'salePrice',     label: 'Sale price (৳, blank = no sale)', type: 'number' },
      { key: 'saleStartDate', label: 'Sale start date (YYYY-MM-DD)',     type: 'text', help: 'Leave blank for immediate' },
      { key: 'saleEndDate',   label: 'Sale end date (YYYY-MM-DD)',       type: 'text', help: 'Leave blank for no expiry' },
      { key: 'rating',  label: 'Star rating (e.g. 4.8)',      type: 'number', min: 0, max: 5 },
      { key: 'color',   label: 'Card color',                  type: 'color',     default: '#3D6453' },
      { key: 'icon',    label: 'Icon',                        type: 'select',    options: ICON_OPTIONS, default: 'icon-leaf' },
      { key: 'ledger',  label: 'Ingredient strip',            type: 'bitext',    help: 'e.g. NEEM OIL 30% · COCONUT OIL 35%' },
      { key: 'description', label: 'Description',            type: 'bitextarea' },
      { key: 'benefits',    label: 'Benefits (one per line)', type: 'bilist' },
      { key: 'image',       label: 'Product photo',           type: 'image' },
    ]
  },
  reviews: {
    label: 'Reviews', singular: 'Review', idPrefix: 'rev',
    listTitle: (item) => item.name || '(anonymous)',
    listSubtitle: (item) => `${item.location||''} · ${item.rating||''}★ · ${item.status||'pending'}`,
    fields: [
      { key: 'name',     label: 'Customer name',    type: 'text', required: true },
      { key: 'location', label: 'Location',          type: 'text' },
      { key: 'rating',   label: 'Rating (1–5)',      type: 'number', min: 1, max: 5, default: 5 },
      { key: 'quote',    label: 'Review text',       type: 'bitextarea', required: true,
        help: 'Customer submitted text goes in EN. Add the BN translation here to show it to Bangla readers.' },
      { key: 'status',   label: 'Status',            type: 'select', options: ['pending','approved','rejected'], default: 'pending' },
      { key: 'photo',    label: 'Customer photo',    type: 'image' },
    ]
  },
  faq: {
    label: 'FAQ', singular: 'Question', idPrefix: 'faq',
    listTitle: (item) => (item.question && item.question.en) || item.question || '(untitled)',
    listSubtitle: () => '',
    fields: [
      { key: 'question', label: 'Question', type: 'bitext',    required: true },
      { key: 'answer',   label: 'Answer',   type: 'bitextarea', required: true },
    ]
  },
  ingredients: {
    label: 'Ingredients', singular: 'Ingredient', idPrefix: 'ing',
    listTitle: (item) => (item.name && item.name.en) || item.name || '(untitled)',
    listSubtitle: (item) => (item.description && item.description.en) || item.description || '',
    fields: [
      { key: 'name',        label: 'Name',              type: 'bitext', required: true },
      { key: 'description', label: 'Short description', type: 'bitext' },
      { key: 'icon',        label: 'Icon',              type: 'select', options: ICON_OPTIONS, default: 'icon-leaf' },
    ]
  },
  compareRows: {
    label: 'Comparison table rows', singular: 'Row', idPrefix: 'cmp',
    listTitle: (item) => (item.label && item.label.en) || item.label || '(untitled)',
    listSubtitle: () => '',
    fields: [
      { key: 'label',   label: 'Factor (left column)', type: 'bitext', required: true },
      { key: 'pureva',  label: 'Pureva column',         type: 'bitext', required: true },
      { key: 'regular', label: 'Regular soap column',   type: 'bitext', required: true },
    ]
  },
  usageSteps: {
    label: 'How-to-use steps', singular: 'Step', idPrefix: 'step',
    listTitle: (item) => (item.title && item.title.en) || item.title || '(untitled)',
    listSubtitle: (item) => (item.text && item.text.en) || item.text || '',
    fields: [
      { key: 'title', label: 'Step name',    type: 'bitext',    required: true },
      { key: 'text',  label: 'Instruction',  type: 'bitext',    required: true },
    ]
  },
  trustBadges: {
    label: 'Trust badges', singular: 'Badge', idPrefix: 'badge',
    listTitle: (item) => (item.title && item.title.en) || item.title || '(untitled)',
    listSubtitle: (item) => (item.text && item.text.en) || item.text || '',
    fields: [
      { key: 'title', label: 'Badge title',   type: 'bitext', required: true },
      { key: 'text',  label: 'Badge subtext', type: 'bitext', required: true },
      { key: 'icon',  label: 'Icon',          type: 'select', options: ICON_OPTIONS, default: 'icon-shield' },
    ]
  },
  heroStats: {
    label: 'Hero stats strip', singular: 'Stat', idPrefix: 'stat',
    listTitle: (item) => item.num || '(untitled)',
    listSubtitle: (item) => (item.label && item.label.en) || item.label || '',
    fields: [
      { key: 'num',   label: 'Number / value', type: 'text',   required: true },
      { key: 'label', label: 'Label',           type: 'bitext', required: true },
    ]
  },
  nav: {
    label: 'Navigation links', singular: 'Link', idPrefix: 'nav',
    listTitle: (item) => (item.label && item.label.en) || item.label || '(untitled)',
    listSubtitle: (item) => item.href || '',
    fields: [
      { key: 'label', label: 'Link text',                  type: 'bitext', required: true },
      { key: 'href',  label: 'Target (e.g. #shop or /)',   type: 'text',   required: true },
    ]
  }
};

module.exports = { SECTIONS, ICON_OPTIONS };
