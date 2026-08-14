/**
 * One-time backfill: generates responsive derivatives for every image the site
 * already references, and records them so the frontend can build a srcSet.
 *
 *   node scripts/backfill-image-variants.js            # everything, resumable
 *   node scripts/backfill-image-variants.js --limit 1  # smoke test
 *   node scripts/backfill-image-variants.js --dry-run  # report only, no writes
 *
 * WHERE THE URL LIST COMES FROM
 *   1. the `images` registry
 *   2. `gallery_images` and `portfolio_images` (added as raw URLs, often with
 *      no `images` row of their own)
 *   3. `image-urls.txt` next to this script, if present — this is how the URLs
 *      hardcoded in the JSX get included
 *
 * WHAT IT WRITES
 *   - derivative files on Hostinger (via upload.php)
 *   - `images` rows: variants, lqip, width, height — inserting a row when the
 *     URL had none, so the public gallery/portfolio joins can find it
 *   - ../Frontend/src/lib/imageManifest.json — the static lookup the frontend
 *     ships with, so no extra request is needed at runtime
 *
 * It is RESUMABLE and idempotent: any URL that already has variants in the
 * manifest is skipped, so an interrupted run can simply be started again.
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const mysql = require("mysql2");

const { generateAndUploadVariants } = require("../lib/imagePipeline");

/**
 * TWO manifests, on purpose.
 *
 * FULL_MANIFEST_PATH is this script's own resume state: every image it has
 * ever processed. It stays in backend/ and is never shipped to the browser.
 *
 * SHIPPED_MANIFEST_PATH is what Vite bundles into the app, and it contains
 * ONLY the URLs hardcoded in the JSX. That distinction matters a lot: the full
 * manifest is 249 KB, which was 56% of the entire main JS chunk, and 185 of
 * its 239 entries were for gallery/portfolio/blog images that already receive
 * their variants from the API response (see attachImageVariants in server.js).
 * The browser was parsing a quarter of a megabyte of JSON to answer questions
 * it was also being told the answer to.
 */
const FULL_MANIFEST_PATH = path.resolve(__dirname, "variants-manifest.json");
const SHIPPED_MANIFEST_PATH = path.resolve(
  __dirname,
  "../../Frontend/src/lib/imageManifest.json"
);
const EXTRA_URLS_PATH = path.resolve(__dirname, "image-urls.txt");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT = (() => {
  const i = args.indexOf("--limit");
  return i >= 0 ? Number(args[i + 1]) : Infinity;
})();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
});

const dbQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });

const loadManifest = () => {
  try {
    return JSON.parse(fs.readFileSync(FULL_MANIFEST_PATH, "utf8"));
  } catch {
    // Fall back to the shipped file so an existing install migrates cleanly
    // rather than reprocessing every image from scratch.
    try {
      return JSON.parse(fs.readFileSync(SHIPPED_MANIFEST_PATH, "utf8"));
    } catch {
      return {};
    }
  }
};

/** The set of URLs written directly into the JSX — the only ones the app bundles. */
const hardcodedUrls = () => {
  try {
    return new Set(
      fs.readFileSync(EXTRA_URLS_PATH, "utf8")
        .split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    );
  } catch {
    return null;
  }
};

const saveManifest = (manifest) => {
  fs.mkdirSync(path.dirname(FULL_MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(FULL_MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  // Ship only what the bundle can actually use.
  const keep = hardcodedUrls();
  const shipped = keep
    ? Object.fromEntries(Object.entries(manifest).filter(([url]) => keep.has(url)))
    : manifest;

  fs.mkdirSync(path.dirname(SHIPPED_MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(SHIPPED_MANIFEST_PATH, JSON.stringify(shipped, null, 2) + "\n");
};

/**
 * server.js adds these columns on boot, but the backfill usually runs against
 * production before the new server has been deployed — so it cannot assume they
 * are there yet.
 */
async function ensureColumns() {
  for (const [column, definition] of [
    ["variants", "TEXT DEFAULT NULL"],
    ["lqip", "TEXT DEFAULT NULL"],
  ]) {
    const rows = await dbQuery(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'images' AND COLUMN_NAME = ?`,
      [column]
    );
    if (rows[0].n > 0) continue;
    await dbQuery(`ALTER TABLE images ADD COLUMN ${column} ${definition}`);
    console.log(`  + added images.${column}`);
  }
}

/** Every distinct Hostinger image URL the site can render, from all sources. */
async function collectUrls() {
  const urls = new Set();
  const add = (u) => {
    if (typeof u === "string" && u.includes("geniestudio.in/uploads/")) urls.add(u);
  };

  for (const [table, column] of [
    ["images", "file_url"],
    ["gallery_images", "image_url"],
    ["portfolio_images", "image_url"],
  ]) {
    try {
      const rows = await dbQuery(`SELECT ${column} AS u FROM ${table}`);
      rows.forEach((r) => add(r.u));
    } catch (err) {
      console.log(`  (skipped ${table}: ${err.message})`);
    }
  }

  // Featured images and any <img> embedded in blog HTML.
  try {
    const rows = await dbQuery("SELECT image, description FROM blogs");
    rows.forEach((r) => {
      add(r.image);
      const found = String(r.description || "").match(
        /https:\/\/geniestudio\.in\/uploads\/[A-Za-z0-9_.\-]+/g
      );
      found?.forEach(add);
    });
  } catch (err) {
    console.log(`  (skipped blogs: ${err.message})`);
  }

  if (fs.existsSync(EXTRA_URLS_PATH)) {
    fs.readFileSync(EXTRA_URLS_PATH, "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach(add);
  }

  return [...urls];
}

/**
 * Derivatives must never themselves be treated as originals — otherwise a
 * second run would generate variants-of-variants.
 */
const isDerivative = (url) => /-(400|800|1200|1600|2000)\.(webp|avif)$/i.test(url);

async function persist(url, result) {
  const filename = url.split("/").pop();
  const variantsJson = JSON.stringify(result.variants);

  const existing = await dbQuery("SELECT id FROM images WHERE file_url = ? LIMIT 1", [url]);

  if (existing.length > 0) {
    await dbQuery(
      "UPDATE images SET variants = ?, lqip = ?, width = ?, height = ? WHERE id = ?",
      [variantsJson, result.lqip, result.width, result.height, existing[0].id]
    );
    return;
  }

  // Gallery/portfolio URLs added through the bulk manager have no registry row.
  // Create one so attachImageVariants() can find them on the public endpoints.
  await dbQuery(
    `INSERT INTO images
      (filename, original_name, file_url, file_path, mime_type, width, height, variants, lqip, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      filename,
      filename,
      url,
      `public_html/uploads/${filename}`,
      result.format ? `image/${result.format}` : null,
      result.width,
      result.height,
      variantsJson,
      result.lqip,
      "backfill",
      Date.now(),
    ]
  );
}

/**
 * Drops LQIP data for images the frontend does not hardcode.
 *
 * The placeholders are base64 WebP, so they barely gzip — left in for all ~240
 * images they were the single largest thing in the JS bundle. Gallery,
 * portfolio and blog images do not need them here: their rows already carry
 * `lqip` from the API (see attachImageVariants in server.js), which costs
 * nothing extra because the page is fetching that JSON anyway.
 *
 * So the manifest keeps LQIP only for URLs written directly into the JSX —
 * the heroes and section images that have no API response to ride along with.
 */
function pruneManifestLqip(manifest) {
  if (!fs.existsSync(EXTRA_URLS_PATH)) {
    console.log("  (no image-urls.txt — keeping every LQIP)");
    return manifest;
  }

  const hardcoded = new Set(
    fs.readFileSync(EXTRA_URLS_PATH, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  );

  let dropped = 0;
  for (const [url, entry] of Object.entries(manifest)) {
    if (entry.lqip && !hardcoded.has(url)) {
      delete entry.lqip;
      dropped += 1;
    }
  }
  console.log(`  pruned LQIP from ${dropped} API-driven images`);
  return manifest;
}

async function main() {
  if (args.includes("--prune-only")) {
    saveManifest(pruneManifestLqip(loadManifest()));
    db.end();
    return;
  }

  console.log(DRY_RUN ? "DRY RUN — nothing will be written\n" : "");

  if (!DRY_RUN) await ensureColumns();

  console.log("Collecting image URLs…");

  const all = await collectUrls();
  const originals = all.filter((u) => !isDerivative(u));
  const manifest = loadManifest();

  const remaining = originals.filter((u) => !manifest[u]?.variants);
  const todo = remaining.slice(0, LIMIT);

  console.log(
    `  ${all.length} URLs found, ${originals.length} originals, ` +
      `${originals.length - remaining.length} already done, ${todo.length} to process\n`
  );

  if (DRY_RUN || todo.length === 0) {
    db.end();
    return;
  }

  let done = 0;
  let failed = 0;
  let savedBytes = 0;

  for (const [i, url] of todo.entries()) {
    const label = `[${i + 1}/${todo.length}] ${url.split("/").pop()}`;
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 120000,
        maxContentLength: Infinity,
      });
      const buffer = Buffer.from(response.data);

      console.log(`${label}  ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

      const result = await generateAndUploadVariants(buffer, url, {
        log: (m) => console.log(m),
      });

      manifest[url] = {
        width: result.width,
        height: result.height,
        lqip: result.lqip,
        variants: result.variants,
      };

      await persist(url, result);

      // Flush after every image so an interrupted run keeps its progress.
      saveManifest(manifest);

      savedBytes += buffer.length;
      done += 1;
    } catch (err) {
      failed += 1;
      console.log(`${label}  ❌ ${err.message}`);
    }
  }

  saveManifest(pruneManifestLqip(manifest));

  console.log(
    `\nDone. ${done} processed, ${failed} failed. ` +
      `${(savedBytes / 1024 / 1024).toFixed(1)} MB of originals now have derivatives.`
  );
  console.log(`Manifest: ${FULL_MANIFEST_PATH}
  shipped:  ${SHIPPED_MANIFEST_PATH}`);
  db.end();
}

main().catch((err) => {
  console.error("Backfill aborted:", err);
  db.end();
  process.exit(1);
});
