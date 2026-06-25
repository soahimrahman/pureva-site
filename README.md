# Pureva — site + no-code admin panel

A redesign of the Pureva handmade soap site, rebuilt as a small full-stack app
so you (or whoever runs the shop) can edit prices, products, reviews, FAQ,
and most of the page text from a password-protected `/admin` panel — no code
edits, no developer needed for day-to-day changes.

## What's in here

- **Public site** — server-rendered (EJS), reads from `data/content.json` on
  every request, so admin edits appear instantly with no rebuild step.
- **Admin panel** at `/admin` — login, dashboard, and add/edit/delete screens
  for every product, review, FAQ item, ingredient, comparison-table row,
  usage step, trust badge, hero stat, and nav link, plus single-page editors
  for brand settings, the hero section, and a few other text blocks.
- **No database server required** — content lives in one JSON file
  (`data/content.json`), written through a small queued file-writer so two
  saves can't corrupt it. This was a deliberate choice, not a shortcut — see
  *"Why this tech stack"* below.

## Why this tech stack

You hadn't decided on hosting yet, so this was built for the option that
works almost anywhere without extra setup:

- **Node.js + Express** — runs on cheap Node-capable shared hosting, a small
  VPS, or platforms like Render/Railway, with no native compilation step.
- **JSON file instead of a real database** — there's exactly one editor (you,
  through the admin panel), low write volume, and no relational data. A real
  database (Postgres, MySQL) would add hosting requirements and a native
  driver for no real benefit at this scale. If the site ever needs multiple
  simultaneous editors or much higher traffic, swap `lib/store.js` for a real
  database — every route already goes through that one file.
- **bcryptjs over bcrypt** — pure JavaScript, no native compilation, so it
  installs cleanly on shared hosting that can't build C++ addons.
- **Plain `fetch`/form-based admin UI, no React build step** — keeps the
  whole thing easy for a future developer (or you, in six months) to read
  without a build pipeline.

One real constraint: **your host needs a persistent filesystem.** `data/
content.json` and uploaded images in `public/uploads/` are written to disk.
Purely "serverless function" hosting (where the filesystem resets on every
request) will silently lose edits. Render, Railway, a VPS, or ordinary Node
shared hosting all work fine; a platform like Vercel's default serverless
functions will not, without adding external storage.

## Quick start

```bash
npm install
cp .env.example .env        # then edit .env — see below
npm run create-admin        # set your admin username & password
npm start                   # serves the site at http://localhost:3000
```

Open `http://localhost:3000` for the site and `http://localhost:3000/admin`
for the admin panel.

**`.env` setup:** open `.env` and set `SESSION_SECRET` to a long random
string (a command to generate one is included in `.env.example`). Don't ship
the default placeholder value to a live server.

**Changing the admin password later:** run `npm run create-admin` again at
any time — it overwrites the existing login.

## Swapping the logo

The header, footer, and favicon all reference `public/assets/logo.svg`.
Easiest path: log into `/admin` → **Brand settings** → upload your real logo
under "Logo" (SVG, PNG, or WEBP all work) — this updates `settings.logoPath`
and the new file is used everywhere automatically, no code touched.

If you'd rather replace the file directly: drop your new logo at
`public/assets/logo.svg` (keep the same filename, square aspect ratio works
best) and it's picked up immediately, since the current placeholder logo is
also referenced by that same path.

## Editing content

Everything under **Lists & collections** in the admin sidebar (products,
reviews, FAQ, ingredients, comparison rows, usage steps, trust badges, hero
stats, nav links) works the same way: a list page with Add/Edit/Delete.
Everything under **Page content** (brand settings, hero, comparison heading,
trust section, final call-to-action, footer) is a single form per section.

Product cards use a color picker instead of a fixed set of presets — pick any
color for a new product's header band and a matching gradient is generated
automatically, so you're not limited to the original four soap colors if you
add a fifth or sixth product later.

## What's placeholder content right now

This was built and styled with realistic example content so you can see the
real design, but several things still need your real data before this goes
live:

- **Prices and ingredient percentages** on all four products are illustrative
  — confirm exact formulation percentages against your production batch
  sheet before publishing.
- **The three customer reviews** are sample text, not real customers — swap
  them for genuine reviews (or delete them) before launch.
- **WhatsApp number and Facebook URL** in Brand settings are placeholders —
  update them or every "Order" button will message the wrong account.
- **The return/exchange policy** in the FAQ is marked as a sample — replace
  it with your actual policy.
- **Hero photo and product photos** are unset, so the site currently shows a
  designed placeholder frame instead of real photography. Upload real photos
  from the admin panel whenever they're ready — the layout already expects
  them.

## Project structure

```
server.js                 Express app entry point
routes/public.js          Renders the homepage
routes/admin.js           Login, dashboard, all CRUD routes
lib/store.js              Reads/writes data/content.json (queued, atomic)
lib/adminStore.js         Reads/writes data/admin.json (login credentials)
lib/sectionConfig.js       Field definitions for every "list" section
lib/singleSectionConfig.js Field definitions for every "single page" section
middleware/requireAuth.js  Blocks /admin routes until logged in
middleware/upload.js       Image upload handling (multer)
views/index.ejs            Public homepage template
views/partials/            Shared header/footer/icon-sprite includes
views/admin/               Login, dashboard, list, and form templates
public/css/style.css       Public site styling
public/css/admin.css       Admin panel styling
public/js/main.js          Public site interactivity (menu, FAQ, etc.)
public/assets/logo.svg     The swappable logo file
public/assets/icons.svg    The custom line-icon set used across the site
data/content.json          All site content (the "database")
data/admin.json            Admin login credentials (created by setup script)
scripts/create-admin.js    Run once to set the admin password
```

## Deployment notes

1. Pick a host with a persistent filesystem and Node 18+ (Render, Railway, a
   VPS with PM2, or shared hosting with a Node.js selector all work).
2. Set the `PORT` and `SESSION_SECRET` environment variables on the host
   (most platforms have a place to set these in their dashboard, instead of
   uploading the `.env` file directly).
3. After the first deploy, run `npm run create-admin` in the host's console
   (or temporarily over SSH) to set the real admin password — don't reuse a
   development password.
4. Put the site behind HTTPS (most modern hosts do this automatically) since
   the admin login posts a password.
5. Back up `data/content.json` and `public/uploads/` periodically — they're
   the only state this app holds.
