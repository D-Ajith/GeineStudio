# Image pipeline

How images get fast, and what to do when they don't.

## The problem this solves

The originals on Hostinger are camera exports — up to **7008 × 4672 (33 MP), 4.6 MB
each** — and they were being rendered into 300px-wide cards. Roughly 100× more
pixels than any viewport uses. Across the site that was **275 MB over 233 images**,
averaging 1.2 MB per image.

## What the CDN can and cannot do

Measured against `geniestudio.in` (`Server: hcdn`):

| Capability | Status |
| --- | --- |
| JPEG → WebP by `Accept` header | ✅ works, same URL |
| AVIF negotiation | ❌ never offered |
| Resizing (`?w=`, `?width=`, `/cdn-cgi/image/`) | ❌ ignored — identical bytes returned |
| `Cache-Control` on `/uploads/` | ✅ `public, max-age=604800` |

Because the CDN cannot resize, a real `srcSet` requires generating the smaller
files ahead of time. That is what this pipeline does.

## Pieces

| File | Role |
| --- | --- |
| `backend/lib/imagePipeline.js` | sharp → 400/800/1200/1600/2000 in WebP **and** AVIF, plus a ~500-byte LQIP; uploads each to Hostinger |
| `backend/server.js` | runs the pipeline on every new upload; serves `variants`/`lqip` on `/api/images`, `/api/gallery`, `/api/portfolio` |
| `backend/scripts/backfill-image-variants.js` | one-time (resumable) pass over every image that already existed |
| `Frontend/src/lib/imageManifest.json` | generated lookup: original URL → variants, dimensions, LQIP |
| `Frontend/src/lib/imageManifest.js` | `lookupImage()` and `bestVariantUrl()` |
| `Frontend/src/lib/useResponsiveImage.js` | viewport-appropriate URL for CSS `background-image` heroes |
| `Frontend/src/components/OptimizedImage.jsx` | emits `<picture>` with AVIF + WebP sources |

## How a page gets a srcSet

`OptimizedImage` resolves variants in this order:

1. a `variants` prop (API rows carry their own — anything uploaded since the last backfill)
2. `imageManifest.json` (everything that existed at backfill time)
3. neither → renders a plain `<img>` with the original URL, exactly as before

Nothing breaks when an image is missing from the manifest; it just misses the
saving. External images (Unsplash, Pexels, Pinterest) fall through untouched.

CSS `background-image` sections cannot carry a `srcSet`, so they call
`bestVariantUrl(src, targetWidth)` instead, driven by the `useTargetWidth()`
hook. Markup and animations are unchanged.

## Running the backfill

```bash
cd backend
node scripts/backfill-image-variants.js --dry-run     # report only
node scripts/backfill-image-variants.js --limit 1     # smoke test one image
node scripts/backfill-image-variants.js               # everything
node scripts/backfill-image-variants.js --prune-only  # re-trim LQIPs
```

It is **resumable and idempotent** — anything already in the manifest is skipped,
so an interrupted run just needs starting again. It needs the backend `.env` (DB
credentials) and network access to Hostinger.

URLs are collected from the `images`, `gallery_images`, `portfolio_images` and
`blogs` tables, plus `backend/scripts/image-urls.txt`. That text file is how URLs
hardcoded in the JSX get included — regenerate it after adding new hardcoded
images:

```bash
cd Frontend/src
grep -rhoE "https://geniestudio\.in/uploads/[A-Za-z0-9_.-]+" --include=*.jsx --include=*.js . \
  | sort -u > ../../backend/scripts/image-urls.txt
```

### Why LQIPs get pruned

Base64 WebP barely gzips, so keeping a placeholder for all ~240 images made the
manifest the largest single thing in the JS bundle. Gallery/portfolio/blog images
do not need one there — their API rows already carry `lqip`, which is free
because the page fetches that JSON anyway. The manifest keeps LQIPs only for URLs
written directly into the JSX.

## Outstanding manual step: AVIF MIME type

Hostinger's Apache has no mapping for `.avif` and serves it as `text/plain`.
Browsers sniff the bytes and render it correctly today (there is no
`X-Content-Type-Options: nosniff`), but this should be made correct. Add to
`public_html/.htaccess` via hPanel → File Manager:

```apache
AddType image/avif .avif
AddType image/webp .webp

# Derivatives are content-addressed by name and never change once written.
<FilesMatch "-(400|800|1200|1600|2000)\.(avif|webp)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

This cannot be automated: `upload.php` writes into `uploads/` with a timestamp
prefix, so it cannot create an `.htaccess`.

## Caching (`Frontend/vercel.json`)

JSON has no comments and Vercel rejects unknown keys, so the reasoning lives here:

| Path | Policy | Why |
| --- | --- | --- |
| `/assets/*` | `max-age=31536000, immutable` | Vite fingerprints these, so a given URL's content can never change. A returning visitor spends bandwidth on photographs instead of re-fetching JS/CSS. |
| `/GenieStudio-logo.webp` | `max-age=604800, stale-while-revalidate` | Not fingerprinted, so it revalidates rather than being immutable. |
| `/index.html` | `max-age=0, must-revalidate` | A cached copy would keep pointing at asset hashes from a previous deploy. |

## Deploy order

1. **Backend to Render** — without it, newly uploaded images get no variants, and
   `/api/gallery` and `/api/portfolio` do not return `variants`. Requires `sharp`
   (already in `package.json`).
2. **Frontend to Vercel** — ships the manifest and the new components.

The two are independent; neither breaks if the other lags.
