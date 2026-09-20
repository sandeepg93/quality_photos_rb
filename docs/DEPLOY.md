# Deploying, backing up, going live

## Hosting

The site is static. Any of these work with no configuration:

- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the
  repository. No build command; publish directory is the project root.
- **GitHub Pages** — push the folder, enable Pages on the branch.
- **Shared hosting / cPanel** — upload the contents of the folder into
  `public_html` over FTP.
- **A USB stick or a laptop with no connection** — hand over
  `dist/quality-photos.offline.html` on its own.

Routing uses the URL hash (`#/portfolio`), so it works on every host with no
rewrite rules. If you later move to a server, swap `location.hash` for the
History API in `js/05-router.js` and add a catch-all rewrite to `index.html`.

## Before you go live

- [ ] Replace both demo accounts in **Users** with real ones and strong passwords.
- [ ] Fill in **Settings** — phone, WhatsApp, email, address, social links.
- [ ] Replace every placeholder photograph; no *PLACEHOLDER* labels should remain.
- [ ] Remove or rewrite the demo projects, services, stories and testimonials.
      Only publish reviews a client actually wrote.
- [ ] Set the SEO title and description in both languages.
- [ ] Check the Marathi side of every page you have translated.
- [ ] Walk the site at 360 px and at 1920 px.
- [ ] Test the enquiry form end to end and confirm it reaches **Enquiries**.
- [ ] Serve over HTTPS.
- [ ] Add `Content-Security-Policy`, `X-Content-Type-Options: nosniff` and
      `Referrer-Policy: strict-origin-when-cross-origin` at the host.

## Backups

Content in this build lives in the browser's local storage, which means it is
per-browser and per-device. Two consequences:

1. Export what you can — **Enquiries → Export CSV** — on a schedule.
2. Clearing site data wipes the CMS. Treat this build as a single-editor setup
   until you move storage to a server (`docs/API.md`).

For a full snapshot, open the console on the site and run:

```js
copy(localStorage.getItem("qp.cms.v1"))   // Chrome/Edge: copies to clipboard
```

Paste that into a `.json` file. To restore:

```js
localStorage.setItem("qp.cms.v1", '<paste the JSON here>'); location.reload();
```

Once the data layer is on PostgreSQL, back up with `pg_dump` nightly and keep
uploaded originals in object storage with versioning switched on.

## Media storage

Uploads are held as resized data URLs in local storage — about 5 MB total.
Fine for a demo or a small site. For a real gallery either:

- put original files in `assets/` and reference them by path, or
- move uploads to the server or S3-compatible storage, generate
  `400/800/1200/1800` WebP and AVIF variants with Sharp, and serve them through
  `srcset` (the markup already emits `sizes`, `loading` and `decoding`).
