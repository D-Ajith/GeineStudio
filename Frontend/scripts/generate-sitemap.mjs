/**
 * Generates public/sitemap.xml.
 *
 *   npm run sitemap
 *
 * Static routes come from src/lib/seoConfig.js, so the sitemap and the pages'
 * own canonical URLs can never disagree — they read the same list. Blog posts
 * are pulled live from the API, because they are created in the admin rather
 * than committed to the repo.
 *
 * The previous setup had five partial sitemaps (sitemap.xml, pages.xml,
 * services.xml, categories.xml, tags.xml) that between them still missed the
 * service detail pages, the gallery and every blog post. This produces one
 * complete file instead.
 *
 * If the API is unreachable the script still writes the static routes rather
 * than failing the build — a sitemap missing its blog posts is much better
 * than no sitemap.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ROUTES } from "../src/lib/seoConfig.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/sitemap.xml");
const SITE = "https://geniestudio.in";
const API = process.env.VITE_API_URL || "https://geinestudio-czl3.onrender.com";

const today = new Date().toISOString().slice(0, 10);

const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );

const urlEntry = ({ loc, lastmod, changefreq, priority }) =>
  [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");

async function fetchBlogs() {
  try {
    const res = await fetch(`${API}/api/blogs`, { signal: AbortSignal.timeout(90000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const posts = (Array.isArray(data) ? data : [])
      .filter((b) => b.status === "published" && b.permalink);
    console.log(`  ${posts.length} published blog posts`);
    return posts;
  } catch (err) {
    console.warn(`  ! could not fetch blogs (${err.message}) — writing static routes only`);
    return [];
  }
}

const entries = ROUTES.map((route) =>
  urlEntry({
    loc: `${SITE}${route.path}`,
    lastmod: today,
    changefreq: route.changefreq,
    priority: route.priority,
  })
);

console.log(`  ${ROUTES.length} static routes`);

for (const post of await fetchBlogs()) {
  entries.push(
    urlEntry({
      loc: `${SITE}/blog/${post.permalink}`,
      lastmod: post.updatedAt
        ? new Date(Number(post.updatedAt)).toISOString().slice(0, 10)
        : today,
      changefreq: "monthly",
      priority: "0.6",
    })
  );
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, xml, "utf8");
console.log(`  wrote ${entries.length} URLs -> ${OUT}`);
