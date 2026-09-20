# Moving the data layer to Node + PostgreSQL

The front end never touches storage directly. It reads and writes through two
functions in `js/03-store.js`:

```js
function load(){ /* returns the whole content object */ }
function save(){ /* persists the whole content object */ }
```

Everything else — renderers, router, CMS — only ever talks to the in-memory
`DB` object. Replace those two functions with network calls and the same UI
runs against a real server, with no changes to the rest of the code.

## Suggested REST surface

| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/login` | sets an HTTP-only, `Secure`, `SameSite=Lax` session cookie |
| POST | `/api/auth/logout` | |
| GET | `/api/pages/:slug` | published only, unless the session is staff |
| GET | `/api/services` · `/api/services/:slug` | |
| GET | `/api/portfolio` · `/api/portfolio/:slug` | paginate `?page=&per=` |
| GET | `/api/stories` · `/api/stories/:slug` | |
| GET | `/api/films` · `/api/embeds` | |
| GET | `/api/settings` · `/api/navigation` | |
| POST | `/api/enquiries` | rate-limited, server-validated, honeypot checked |
| GET/POST/PUT/PATCH/DELETE | `/api/admin/<resource>` | session + role required |
| POST | `/api/admin/media` | multipart; validate MIME by magic bytes, not by extension |
| PATCH | `/api/admin/pages/:id/sections` | accepts the reordered id array |

Return one envelope everywhere:

```json
{ "success": false, "message": "Validation failed", "errors": { "email": "…" } }
```

## Tables

`users`, `roles`, `pages`, `page_sections`, `services`, `portfolio_categories`,
`portfolio_projects`, `portfolio_media`, `stories`, `story_media`, `media`,
`videos`, `social_embeds`, `testimonials`, `enquiries`, `navigation_items`,
`site_settings`, `seo_metadata`, `activity_logs`.

Keep the searchable fields relational — slug, status, category, publish date,
display order — and index them. `page_sections.data` is the one place a JSON
column earns its keep, because section shapes differ by type. Marathi lives in
`*_mr` columns alongside their English twins, matching the field names the CMS
already uses.

Soft-delete with `deleted_at` on content tables; hard-delete media only after
checking nothing references it.

## Things the server must do that a browser cannot

- Hash passwords with bcrypt or argon2 (the SHA-256 here is a placeholder).
- Issue CSRF tokens and verify them on every mutating request.
- Throttle login and enquiry endpoints by IP.
- Verify upload MIME by magic bytes, cap file size, rewrite filenames, strip
  EXIF, and store outside the web root or in object storage.
- Generate the responsive variants (`400/800/1200/1800`, WebP + AVIF) with
  Sharp, and serve `srcset`.
- Send the enquiry notification email over SMTP.
- Set `Content-Security-Policy`, including a `frame-src` allow-list that
  matches `EMBED_HOSTS`.
- Emit `sitemap.xml` and `robots.txt`.

## Environment

```
NODE_ENV=
PORT=
DATABASE_URL=
SESSION_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Never commit `.env`, and never expose any of these to the browser.
