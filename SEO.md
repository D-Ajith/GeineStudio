# SEO

## Where the site actually runs

Worth stating up front, because it changes what config matters:

`https://geniestudio.in/` is served by **Hostinger Apache** (`platform: hostinger`,
`panel: hpanel`, `Server: hcdn`) — **not Vercel**. Verified: assets come back with
Hostinger's default `Cache-Control: public, max-age=604800`, not the `immutable`
policy in `Frontend/vercel.json`.

**`Frontend/vercel.json` is therefore inert.** It is harmless to keep for a future
Vercel deploy, but nothing in it is applied today. Anything that must take effect
has to go in `public_html/.htaccess` — see the snippet at the bottom.

Brotli compression is already active, so that needs nothing.

## How per-route metadata works

The site is a client-rendered SPA served as one static `index.html`, so:

- **`index.html`** carries the full default set — title, description, canonical,
  Open Graph, Twitter, favicon, and the `WebSite` + `Organization` +
  `LocalBusiness` JSON-LD graph. This is what non-JS crawlers see.
- **`src/components/Seo.jsx`** renders per-route overrides. React 19 hoists
  `<title>`, `<meta>` and `<link>` into `<head>` from anywhere in the tree and
  removes them on unmount, so this needs no `react-helmet` and no manual DOM work.
- **`src/lib/seoConfig.js`** holds every route's title and description in one
  place, so duplicates are visible at a glance and the sitemap reads the same list.

### The one real limitation

Googlebot renders JavaScript, so it sees the per-route tags and indexes each page
correctly. **Crawlers that do not render JS — Facebook, LinkedIn, WhatsApp, Slack —
only ever see `index.html`.** Link previews for deep routes will show the homepage
card.

Fixing that properly needs prerendering or SSR (`vite-plugin-prerender`,
`react-snap`, or moving to a framework that renders on the server). Nothing else
in this setup can work around it. Blog posts already have a partial workaround: the
backend serves a real OG-tagged HTML page for share crawlers.

## What each page gets

| Route | Title | Extra schema |
| --- | --- | --- |
| `/` | Set verbatim from the brief | WebSite, Organization, LocalBusiness (static) + BreadcrumbList |
| `/services` + 5 service pages | `<Service> in Visakhapatnam \| GenieStudio` | `Service` + `BreadcrumbList` |
| `/services/business-portfolio-shoots` | Business Portfolio Shoots | `Service` + `BreadcrumbList` |
| `/about` `/portfolio` `/gallery` `/blogs` `/contact` | Unique per page | `BreadcrumbList` |
| `/blog/:slug` | `<post title> \| GenieStudio` | `BlogPosting` + `BreadcrumbList` |
| unmatched | Page Not Found | `noindex, follow` |

All 13 static titles and descriptions are unique — verified, no duplicates.

> **Note on the homepage title and description:** both are used exactly as
> specified in the brief. The title is 77 characters and the description 159, so
> Google will likely truncate them in results (it typically cuts around 60 and
> 155). They were left verbatim because they were given as exact copy — shortening
> them is a content decision, not a technical one.

## Fixes applied beyond the brief

- **`robots.txt` pointed at the wrong domain.** It listed
  `Sitemap: https://geinestudio.in/sitemap.xml` — `geinestudio`, not `geniestudio`.
  Google could never fetch the sitemap from it.
- **Soft 404s.** Apache rewrites every unmatched path to `index.html`, so typo'd
  URLs returned HTTP 200 with a blank page. `NotFound` now renders with `noindex`.
- **Three competing H1s on the homepage.** All hero slides sit in the DOM at once,
  so each rotating headline was an `<h1>`. They are now `<h2>` (visually identical
  — Tailwind preflight makes headings inherit size and weight) and the page has one
  stable `sr-only` H1 naming the five services.
- **Gallery had no H1 at all.** Added an `sr-only` one.
- **Placeholder copy was live.** The homepage service cards rendered
  `"Professional video..."`, `"Stunning product photography..."` and four more
  ellipsis stubs as visible text. Replaced with real descriptions, all within a few
  characters of each other so the equal-height cards keep their layout.
- **Inconsistent service naming.** The carousel said "Podcast Production" and
  "Event Photography" while the service pages said "Podcast Shoots" and "Event
  Shoots". Aligned to the service names.
- **Five partial sitemaps.** `sitemap.xml`, `pages.xml`, `services.xml`,
  `categories.xml` and `tags.xml` between them still missed every service detail
  page, the gallery and all blog posts.

## Sitemap

```bash
cd Frontend
npm run sitemap     # regenerate on demand
npm run build       # regenerates automatically, then builds
```

`scripts/generate-sitemap.mjs` reads static routes from `seoConfig.js` and pulls
published posts from the API, so it cannot drift from the pages' own canonicals.
If the API is unreachable it still writes the static routes rather than failing
the build.

The old `pages.xml` / `services.xml` / `categories.xml` / `tags.xml` are now
superseded by the single `sitemap.xml`. They are left in place in case anything
links to them; nothing references them and they can be deleted.

## `.htaccess` for `public_html`

`vercel.json` does nothing here, so these belong in Apache. **Back up the existing
`.htaccess` first** — it contains the SPA rewrite that makes deep links work, and
these lines should be *added* to it, not replace it. Verify a deep link such as
`/services/podcast-shoots` still loads after deploying.

```apache
# --- Correct MIME types -------------------------------------------------
# Hostinger serves .avif as text/plain. Browsers sniff the bytes so it renders
# today, but only because no nosniff header is sent.
AddType image/avif .avif
AddType image/webp .webp

# --- Caching ------------------------------------------------------------
<IfModule mod_headers.c>
  # Vite fingerprints these, so the content at a given URL never changes.
  <FilesMatch "\.(js|css|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # Image derivatives are content-addressed by name and never rewritten.
  <FilesMatch "-(400|800|1200|1600|2000)\.(avif|webp)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # index.html must revalidate or it keeps pointing at old asset hashes.
  <FilesMatch "^index\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>
```

## After deploying

1. Google Search Console → submit `https://geniestudio.in/sitemap.xml`.
2. Use URL Inspection on `/` and one service page, then **View Crawled Page** to
   confirm Google's render shows the per-route `<title>` — that is the check that
   proves the JS-rendered metadata is being picked up.
3. Run the [Rich Results Test](https://search.google.com/test/rich-results) on the
   homepage and one service page to confirm the JSON-LD parses.
