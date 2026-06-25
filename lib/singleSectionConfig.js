// lib/singleSectionConfig.js — single-object sections edited with one form.
// Same field types as sectionConfig including bitext / bitextarea / bilist.

const SINGLE_SECTIONS = {
  settings: {
    label: 'Brand settings',
    intro: 'Brand name, logo, contact links, language default, and the announcement bar.',
    fields: [
      { key: 'brandName',       label: 'Brand name',               type: 'text',      required: true },
      { key: 'tagline',         label: 'Tagline',                   type: 'bitext' },
      { key: 'logoPath',        label: 'Logo',                      type: 'image',
        help: 'Upload a square SVG, PNG, or WEBP — replaces the logo everywhere.' },
      { key: 'whatsappNumber',  label: 'WhatsApp number',           type: 'text',
        help: 'Digits only with country code, no + or spaces — e.g. 8801XXXXXXXXX' },
      { key: 'facebookUrl',     label: 'Facebook page URL',         type: 'text' },
      { key: 'defaultLanguage', label: 'Default language',          type: 'select', options: ['en','bn'], default: 'en' },
      { key: 'metaDescription', label: 'Search engine description', type: 'bitextarea' },
      { key: 'announceText',    label: 'Announcement bar text',     type: 'bitext',
        help: 'Wrap any phrase in <strong>...</strong> to bold it.' },
    ]
  },
  hero: {
    label: 'Homepage hero',
    intro: 'The first thing visitors see.',
    fields: [
      { key: 'eyebrow',            label: 'Small eyebrow label',        type: 'bitext' },
      { key: 'headline',           label: 'Headline (main)',             type: 'bitext', required: true },
      { key: 'headlineAccent',     label: 'Headline italic accent',     type: 'bitext' },
      { key: 'subhead',            label: 'Subheading',                  type: 'bitext' },
      { key: 'noteHtml',           label: 'Highlighted note box',        type: 'bitext',
        help: 'Wrap a phrase in <strong>...</strong> to bold it.' },
      { key: 'primaryCtaLabel',    label: 'Primary button label',        type: 'bitext' },
      { key: 'secondaryCtaLabel',  label: 'Secondary button label',      type: 'bitext' },
      { key: 'image',              label: 'Hero photo',                  type: 'image',
        help: 'Leave empty to keep the designed placeholder frame.' },
    ]
  },
  compare: {
    label: 'Comparison section heading',
    intro: 'The heading above the comparison table.',
    fields: [
      { key: 'eyebrow',  label: 'Eyebrow label', type: 'bitext' },
      { key: 'title',    label: 'Title',          type: 'bitext', required: true },
      { key: 'subtitle', label: 'Subtitle',       type: 'bitext' },
    ]
  },
  trust: {
    label: 'Trust section',
    intro: 'The "why trust us" block. Edit the badge cards separately from the Lists & collections panel.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow label', type: 'bitext' },
      { key: 'title',   label: 'Title',          type: 'bitext', required: true },
      { key: 'body',    label: 'Paragraph',       type: 'bitextarea' },
      { key: 'points',  label: 'Checklist points (one per line)', type: 'bilist' },
    ]
  },
  finalCta: {
    label: 'Final call-to-action',
    intro: 'The closing section before the footer.',
    fields: [
      { key: 'headline',       label: 'Headline',               type: 'bitext', required: true },
      { key: 'headlineAccent', label: 'Headline italic accent', type: 'bitext' },
      { key: 'offerText',      label: 'Offer pill text',        type: 'bitext' },
      { key: 'body',           label: 'Paragraph',              type: 'bitextarea' },
      { key: 'trustLine',      label: 'Trust line items (one per line)', type: 'bilist' },
    ]
  },
  footer: {
    label: 'Footer',
    intro: 'The bottom of every page.',
    fields: [
      { key: 'copyright', label: 'Copyright line',     type: 'bitext' },
      { key: 'tagline',   label: 'Right-aligned line', type: 'bitext' },
    ]
  }
};

module.exports = { SINGLE_SECTIONS };
