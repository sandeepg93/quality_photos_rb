# Quality Photos — website + CMS

A complete photography website with a built-in content manager, written in
plain **HTML, CSS and vanilla JavaScript**. No build step, no framework, no
npm install. Works offline from the file system and online from any static
host. Bilingual: **English and मराठी**.

---

## Quick start

**Offline, right now**
Open `dist/quality-photos.offline.html` by double-clicking it. Everything
works — pages, CMS, uploads, language switch. The only thing that needs the
internet is the web font; without it the site falls back to system faces and
still looks correct.

**As a normal site**
Serve the folder with any static server:

```sh
python3 -m http.server 8080      # then visit http://localhost:8080
```

Or drag the whole folder into Netlify / Vercel / Cloudflare Pages, or drop it
into `public_html` on shared hosting. There is nothing to compile.

**Admin**
Click **CMS** in the footer, or go to `#/admin`.

| Role | Email | Password |
|---|---|---|
| Super admin | `admin@qualityphotos.in` | `studio2026` |
| Editor | `editor@qualityphotos.in` | `editor2026` |

Change both in **Users** before you put this anywhere public.

---

## What's in the box

```
quality-photos/
├── index.html                      the page shell (markup only)
├── css/
│   ├── site.css                    design tokens + public site
│   └── admin.css                   the CMS interface
├── js/
│   ├── 01-utils.js                 helpers, placeholder image generator
│   ├── 02-i18n.js                  English / Marathi strings + switcher
│   ├── 03-store.js                 the data layer, seed content, embed whitelist
│   ├── 04-sections.js              every section renderer
│   ├── 05-router.js                routes, detail pages, header/footer, SEO
│   ├── 06-behaviour.js             lightbox, embeds, forms, cursor, scroll
│   ├── 07-admin-core.js            auth, roles, modal, form builder
│   ├── 08-admin-resources.js       CRUD tables + dashboard
│   ├── 09-admin-pages.js           page builder, drag-and-drop, preview
│   ├── 10-admin-media.js           media library, enquiries, navigation
│   └── 11-admin-settings.js        settings, social, users, logs, boot
├── dist/quality-photos.offline.html  single-file bundle (generated)
├── assets/                         drop real photographs here if you prefer files to uploads
├── docs/
│   ├── API.md                      how to move the data layer to Node + PostgreSQL
│   └── DEPLOY.md                   hosting, backups, production checklist
├── build.py / build.sh             rebuilds the single-file bundle
└── .gitignore
```

Edit `css/` and `js/`, then run `./build.sh` (or `python3 build.py`) to
regenerate the offline bundle. `python3 build.py --no-fonts` strips the Google
Fonts request for a file with zero outbound requests.

---

## Bilingual content (English / मराठी)

The toggle sits in the header and the mobile menu, and the choice is
remembered. Interface strings live in `js/02-i18n.js` under `STR.en` and
`STR.mr`.

Content is translated field by field. Every translatable field has a twin with
an `_mr` suffix — `title` / `title_mr`, `heading` / `heading_mr`,
`excerpt` / `excerpt_mr`. The CMS shows both boxes next to each other, labelled
*(मराठी)*. If a Marathi field is left empty the English text is used, so the
site is never half-broken while you translate.

Marathi pages switch to Noto Sans Devanagari and get a looser line height and a
smaller display scale, because Devanagari needs more vertical room than Latin.

---

## Social media embeds

**Social embeds** in the CMS takes the URL of a post and works out the platform
by itself:

| Platform | What you get |
|---|---|
| YouTube (`watch?v=`, `youtu.be`, `/shorts/`) | privacy-mode player in a 16:9 box |
| Vimeo | player in a 16:9 box |
| Instagram post / reel / TV | official post embed |
| Facebook post | official post plugin |
| Pinterest pin | official pin embed |
| X | link card — X does not offer an iframe |

Each card carries the platform's colour chip, name and an "open in a new tab"
link, and **nothing loads until the visitor presses play**. No third-party
request is made just by visiting the page.

Only the hosts in `EMBED_HOSTS` (`js/03-store.js`) are accepted. Any other
domain is rejected in the CMS with an error, so an admin cannot paste raw
`<iframe>` code or point at an arbitrary site.

Instagram is never scraped. The social wall shows placeholders that link to the
profile until you add approved posts yourself.

---

## Images

**Media** → drag files in, or use the upload button. JPEG, PNG, WebP, AVIF and
GIF up to 8 MB each. Every upload is resized on the client into a 1600 px
display copy and a 420 px thumbnail, so nothing enormous is ever served. You
can set alt text, caption, credit, folder and tags, and pick the file in any
image field across the CMS.

Anything without a real photograph falls back to a generated placeholder frame,
clearly labelled *PLACEHOLDER* on the front end — so an unfinished site never
pretends to show the studio's work.

Uploads in this build live in browser storage, which is roughly 5 MB. That is
fine for demonstrating and for a small site. For a real gallery, either drop
files into `assets/` and reference them, or move storage to a server —
see `docs/API.md`.

---

## Responsive

Laid out with CSS Grid, Flexbox and fluid `clamp()` type; checked at 360, 390,
430, 768, 1024, 1280, 1440 and 1920 px. No horizontal overflow, no clipped
controls, no overlapping text. Tables and wide blocks scroll inside their own
container. The custom cursor and parallax turn themselves off on touch devices,
on narrow screens, and whenever the visitor has asked for reduced motion.

---

## What it does

**Public** — home, about, services + detail, portfolio + detail, stories +
detail, films, contact, 404. Section order, visibility and content all come
from the store, so rearranging the homepage in the CMS rearranges the real
homepage. Lightbox with keyboard, swipe, zoom, captions, counter and a focus
trap. Click-to-load video. Validated enquiry form with a honeypot. WhatsApp
deep links built from settings. Per-route titles, descriptions, Open Graph tags
and JSON-LD.

**CMS** — dashboard, page builder with drag-and-drop ordering and per-section
visibility, portfolio, services, stories, films, social embeds, testimonials,
media library, enquiries with statuses and CSV export, navigation, settings,
users and an activity log. Device previews for unpublished content. Every
destructive action asks first.

**Security posture for a client-side build** — all CMS content is escaped
before it reaches the DOM, animation choices are a fixed enum rather than
arbitrary script, embed URLs are whitelisted and parsed, login throttles after
five failures, passwords are stored as SHA-256 hashes, and role permissions are
checked in the functions that mutate data, not only hidden in the menu.

---

## Replacing the demo content

Everything shipped is demo material and is marked as such. To clear it:

1. Sign in as super admin.
2. **Settings → Danger zone → Reset everything** for a clean reseed, or delete
   items one by one.
3. Upload real photographs in **Media**, then pick them in each image field.
4. Fill in **Settings**: brand, phone, WhatsApp number, email, address, social
   links, SEO defaults — nothing about the business is hard-coded.
5. Replace the demo users in **Users**.

Anything the studio has not supplied is left as `[CONTENT TO BE CONFIGURED]`
rather than invented.
