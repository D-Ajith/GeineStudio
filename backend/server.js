require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { generateAndUploadVariants } = require("./lib/imagePipeline");

const PORT = process.env.PORT || 5000;
const app = express();

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://geniestudio.in",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ================= DB CONNECTION =================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.query("SELECT 1", (err) => {
  if (err) console.log("❌ DB ERROR:", err);
  else console.log("✅ DB Connected Stable");
});

// Promise wrapper so the newer image endpoints can use async/await
const dbQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });

/**
 * `images.variants` is stored as a JSON string in a TEXT column. Rows written
 * before the responsive pipeline existed hold NULL, and a hand-edited row could
 * hold something unparseable — in both cases the caller should just get null and
 * fall back to the plain `file_url`, never a 500.
 */
const parseVariants = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Attaches variants/lqip to any list of rows carrying an image URL, by looking
 * the URL up in the `images` registry.
 *
 * Gallery and portfolio rows store only a URL — many were added as raw URLs via
 * the bulk manager and have no `images` row of their own. One IN() query keeps
 * this to a single round trip instead of one per item.
 */
const attachImageVariants = async (rows, urlKey = "image_url") => {
  const urls = [...new Set(rows.map((r) => r[urlKey]).filter(Boolean))];
  if (urls.length === 0) return rows;

  let byUrl = new Map();
  try {
    const found = await dbQuery(
      `SELECT file_url, variants, lqip, width, height FROM images WHERE file_url IN (?)`,
      [urls]
    );
    byUrl = new Map(found.map((r) => [r.file_url, r]));
  } catch (err) {
    // A lookup failure must never take down the public page — the items still
    // render from their original URL, just without a srcSet.
    console.error("Variant lookup failed:", err.message);
    return rows;
  }

  return rows.map((row) => {
    const match = byUrl.get(row[urlKey]);
    if (!match) return row;
    return {
      ...row,
      variants: parseVariants(match.variants),
      lqip: match.lqip || null,
      width: match.width || null,
      height: match.height || null,
    };
  });
};

// ================= IMAGES TABLE =================
// Central registry of every image pushed to Hostinger — used by the standalone
// Image Library (/admin/images) and by the Blog Editor's Featured Image.
// Blogs keep storing the image URL, so nothing about existing rows changes.
db.query(
  `CREATE TABLE IF NOT EXISTS images (
     id            INT AUTO_INCREMENT PRIMARY KEY,
     filename      VARCHAR(255) NOT NULL,
     original_name VARCHAR(255) DEFAULT NULL,
     file_url      VARCHAR(500) NOT NULL,
     file_path     VARCHAR(500) DEFAULT NULL,
     mime_type     VARCHAR(100) DEFAULT NULL,
     file_size     INT          DEFAULT NULL,
     width         INT          DEFAULT NULL,
     height        INT          DEFAULT NULL,
     source        VARCHAR(32)  DEFAULT 'library',
     created_at    BIGINT       DEFAULT NULL,
     UNIQUE KEY uniq_file_url (file_url(191))
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  (err) => {
    if (err) console.log("❌ images table error:", err.message);
    else console.log("✅ images table ready");
  }
);

// Responsive derivatives live alongside the original row. Added by migration
// rather than in CREATE TABLE above, because the table already exists in
// production and CREATE TABLE IF NOT EXISTS would skip the new columns.
//
//   variants — JSON: { webp: { 400: url, … }, avif: { 400: url, … } }
//   lqip     — base64 data URI of the ~24px blur-up placeholder
//
// Both are nullable: an image with no derivatives yet still renders from
// file_url, it just does not get a srcSet.
const addColumnIfMissing = (table, column, definition) => {
  db.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
    (err, rows) => {
      if (err) return console.log(`❌ ${table}.${column} check failed:`, err.message);
      if (rows[0].n > 0) return;
      db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (alterErr) => {
        if (alterErr) console.log(`❌ ${table}.${column} add failed:`, alterErr.message);
        else console.log(`✅ ${table}.${column} added`);
      });
    }
  );
};

addColumnIfMissing("images", "variants", "TEXT DEFAULT NULL");
addColumnIfMissing("images", "lqip", "TEXT DEFAULT NULL");

// ================= PORTFOLIO =================
// Categories the public Portfolio page filters by. "all" is a view, not a
// stored category, so it is intentionally absent.
const PORTFOLIO_CATEGORIES = [
  "corporate",
  "events",
  "product",
  "podcast",
  "professional",
  "business",
];

// The images the Portfolio page shipped with, used to seed the table on first
// run so the public page looks identical the moment this goes live.
const PORTFOLIO_SEED = [
  ["corporate", "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?w=800&q=80", "Corporate Leadership Portraits", "Professional portraits crafted for executives and leadership branding."],
  ["corporate", "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=800&q=80", "Office & Workplace Culture", "Authentic visuals showcasing company culture and work environment."],
  ["corporate", "https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?w=800&q=80", "Team & Staff Photography", "Clean and consistent team photos for websites and corporate profiles."],
  ["events", "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?w=800&q=80", "Corporate Conferences", "Complete coverage of conferences, seminars, and business summits."],
  ["events", "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?w=800&q=80", "Brand Launch Events", "High-energy visuals capturing brand launches and promotions."],
  ["events", "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?w=800&q=80", "Corporate Celebrations", "Professional documentation of corporate gatherings and milestones."],
  ["product", "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?w=800&q=80", "E-commerce Product Shoots", "Clean, conversion-focused product photography for online stores."],
  ["product", "https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?w=800&q=80", "Lifestyle Product Photography", "Products captured in real-life environments for stronger storytelling."],
  ["product", "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?w=800&q=80", "Food & Commercial Products", "Stylized product visuals designed for marketing and advertising."],
  ["podcast", "https://images.pexels.com/photos/7586659/pexels-photo-7586659.jpeg?w=800&q=80", "Podcast Studio Setup", "Professional podcast visuals with studio lighting and clean framing."],
  ["podcast", "https://images.pexels.com/photos/7648047/pexels-photo-7648047.jpeg?w=800&q=80", "Video Podcast Recording", "High-quality video podcasts ready for YouTube and social platforms."],
  ["podcast", "https://images.pexels.com/photos/7988086/pexels-photo-7988086.jpeg?w=800&q=80", "Interview Podcast Sessions", "Clean, cinematic podcast interviews with professional audio setup."],
  ["professional", "https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?w=800&q=80", "Personal Branding Portraits", "Premium portraits for professionals, founders, and creators."],
  ["professional", "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=800&q=80", "Studio Portrait Sessions", "Well-lit studio portraits with a polished professional finish."],
  ["professional", "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?w=800&q=80", "Creative Professional Portraits", "Stylish portraits designed to stand out across platforms."],
  ["business", "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?w=800&q=80", "Brand Portfolio Photography", "Visual storytelling crafted for business portfolios and websites."],
  ["business", "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?w=800&q=80", "Startup & Company Showcases", "End-to-end business visuals highlighting products, teams, and spaces."],
  ["business", "https://images.pexels.com/photos/3182765/pexels-photo-3182765.jpeg?w=800&q=80", "Corporate Brand Storytelling", "Consistent imagery designed to reflect brand identity and vision."],
];

db.query(
  `CREATE TABLE IF NOT EXISTS portfolio_images (
     id          INT AUTO_INCREMENT PRIMARY KEY,
     category    VARCHAR(50)  NOT NULL,
     image_url   VARCHAR(500) NOT NULL,
     title       VARCHAR(255) DEFAULT NULL,
     description TEXT         NULL,
     sort_order  INT          DEFAULT 0,
     created_at  BIGINT       DEFAULT NULL,
     updated_at  BIGINT       DEFAULT NULL,
     UNIQUE KEY uniq_category_url (category, image_url(191)),
     KEY idx_category (category)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  (err) => {
    if (err) return console.log("❌ portfolio_images table error:", err.message);
    console.log("✅ portfolio_images table ready");

    // Seed once — only when the table is completely empty, so an admin who
    // deletes images never gets them silently restored on the next restart.
    db.query("SELECT COUNT(*) AS n FROM portfolio_images", (err2, rows) => {
      if (err2 || rows[0].n > 0) return;
      const now = Date.now();
      const values = PORTFOLIO_SEED.map(([cat, url, title, desc], i) => [
        cat, url, title, desc, i, now, now,
      ]);
      db.query(
        `INSERT INTO portfolio_images
           (category, image_url, title, description, sort_order, created_at, updated_at)
         VALUES ?`,
        [values],
        (err3) => {
          if (err3) console.log("❌ portfolio seed error:", err3.message);
          else console.log(`✅ portfolio seeded with ${values.length} images`);
        }
      );
    });
  }
);

// ================= DOME GALLERY =================
// One flat, ordered list of images for the DomeGallery component on /gallery.
// Seeded from the values that used to be hardcoded in DomeGallery.jsx.
const GALLERY_SEED = [
  ["https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "Abstract art"],
  ["https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "Modern sculpture"],
  ["https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "Digital artwork"],
  ["https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "Contemporary art"],
  ["https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "Geometric pattern"],
  ["https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "Textured surface"],
  ["https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large", "Social media image"],
];

db.query(
  `CREATE TABLE IF NOT EXISTS gallery_images (
     id         INT AUTO_INCREMENT PRIMARY KEY,
     image_url  VARCHAR(500) NOT NULL,
     alt        VARCHAR(255) DEFAULT NULL,
     sort_order INT          DEFAULT 0,
     created_at BIGINT       DEFAULT NULL,
     updated_at BIGINT       DEFAULT NULL,
     UNIQUE KEY uniq_gallery_url (image_url(191))
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  (err) => {
    if (err) return console.log("❌ gallery_images table error:", err.message);
    console.log("✅ gallery_images table ready");

    // Seed once, only while empty — deleting images must not bring them back
    db.query("SELECT COUNT(*) AS n FROM gallery_images", (err2, rows) => {
      if (err2 || rows[0].n > 0) return;
      const now = Date.now();
      const values = GALLERY_SEED.map(([url, alt], i) => [url, alt, i, now, now]);
      db.query(
        "INSERT INTO gallery_images (image_url, alt, sort_order, created_at, updated_at) VALUES ?",
        [values],
        (err3) => {
          if (err3) console.log("❌ gallery seed error:", err3.message);
          else console.log(`✅ dome gallery seeded with ${values.length} images`);
        }
      );
    });
  }
);

// ================= MULTER =================
// Multer is only used as a temp buffer before uploading to Hostinger
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// ================= HELPER: Upload file to Hostinger =================
// Uploads temp file to upload.php, returns full HTTPS URL, cleans up temp file
const uploadToHostinger = async (tempFilePath) => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(tempFilePath));

    const response = await axios.post(
      "https://geniestudio.in/upload.php",
      formData,
      { headers: formData.getHeaders() }
    );

    return response.data.url; // full HTTPS URL from Hostinger
  } finally {
    // Always clean up the temp file, whether upload succeeded or failed
    try {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    } catch (_) {}
  }
};

// ================= HELPER: Upload + register an image =================
// THE single entry point for getting an image onto Hostinger. Both the standalone
// Image Library and the Blog Editor's Featured Image go through this, so there is
// exactly one upload path:
//
//   multer temp file → upload.php → public_html/uploads/ → HTTPS url → images row
//
// The DB row is a convenience index; if the insert fails the upload itself is
// still returned so blog creation never breaks because of the library.
const uploadAndRegisterImage = async (file, meta = {}) => {
  // Read the bytes before uploadToHostinger runs — it deletes the temp file.
  let sourceBuffer = null;
  try {
    sourceBuffer = fs.readFileSync(file.path);
  } catch (readErr) {
    console.error("Could not read temp file for variants:", readErr.message);
  }

  const url = await uploadToHostinger(file.path);
  if (!url) throw new Error("Upload service did not return a URL");

  const filename = String(url).split("/").pop().split("?")[0];

  // Responsive derivatives. Deliberately best-effort: if sharp runs out of
  // memory on a 33-megapixel original, or Hostinger rejects a variant, the
  // original has already uploaded successfully and the admin still gets a
  // working URL back. The image simply renders without a srcSet until the
  // backfill script picks it up.
  let derived = null;
  if (sourceBuffer) {
    try {
      derived = await generateAndUploadVariants(sourceBuffer, filename);
    } catch (variantErr) {
      console.error("Variant generation failed (original still uploaded):", variantErr.message);
    }
  }
  const record = {
    id: null,
    filename,
    original_name: file.originalname || filename,
    url,
    file_url: url,
    file_path: `public_html/uploads/${filename}`,
    mime_type: file.mimetype || null,
    file_size: file.size || null,
    // Prefer the dimensions sharp measured (post EXIF-rotation) over whatever
    // the client reported, so width/height always match the bytes on disk.
    width: derived?.width || Number(meta.width) || null,
    height: derived?.height || Number(meta.height) || null,
    variants: derived?.variants || null,
    lqip: derived?.lqip || null,
    created_at: Date.now(),
  };

  try {
    // Same physical file must never produce two library rows
    const existing = await dbQuery("SELECT id FROM images WHERE file_url = ? LIMIT 1", [url]);
    if (existing.length > 0) {
      record.id = existing[0].id;
      return record;
    }

    const result = await dbQuery(
      `INSERT INTO images
        (filename, original_name, file_url, file_path, mime_type, file_size, width, height, variants, lqip, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.filename,
        record.original_name,
        record.file_url,
        record.file_path,
        record.mime_type,
        record.file_size,
        record.width,
        record.height,
        record.variants ? JSON.stringify(record.variants) : null,
        record.lqip,
        meta.source || "library",
        record.created_at,
      ]
    );
    record.id = result.insertId;
  } catch (dbErr) {
    console.error("DB error registering image (upload still succeeded):", dbErr.message);
  }

  return record;
};

// ================= HELPER: Normalize image URL =================
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return String(imagePath);
};

// ================= JWT MIDDLEWARE =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(403).json({ success: false, message: "No token provided" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("🚀 GenieStudio Backend is Working!");
});

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password required" });

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length === 0)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const user = result[0];
    const isHashed = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
    const passwordMatch = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!passwordMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ success: true, token });
  });
});

// ================= IMAGE LIBRARY =================
// Standalone upload — no blog required. Uses the exact same pipeline as the
// Blog Editor's Featured Image (multer → upload.php → public_html/uploads/).
app.post("/api/images", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No image file received" });

    const image = await uploadAndRegisterImage(req.file, {
      width: req.body.width,
      height: req.body.height,
      source: "library",
    });

    res.json({ success: true, message: "Image uploaded successfully", image });
  } catch (err) {
    console.error("Error uploading image:", err.message);
    res.status(500).json({ success: false, message: "Image upload failed. Please try again." });
  }
});

// List every image in the library, newest first
app.get("/api/images", verifyToken, async (req, res) => {
  try {
    const images = await dbQuery(
      "SELECT * FROM images ORDER BY created_at DESC, id DESC"
    );
    res.json({
      success: true,
      images: images.map((img) => ({
        ...img,
        url: img.file_url,
        variants: parseVariants(img.variants),
      })),
    });
  } catch (err) {
    console.error("DB error listing images:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
});

// Renames the DISPLAY NAME only.
// The Hostinger file, file_url, file_path and filename are deliberately never
// touched — every blog already pointing at the HTTPS URL must keep working.
app.put("/api/images/:id", verifyToken, async (req, res) => {
  try {
    const name = String(req.body.original_name || "").trim();
    if (!name)
      return res.status(400).json({ success: false, message: "Display name cannot be empty" });
    if (name.length > 255)
      return res.status(400).json({ success: false, message: "Display name is too long (max 255 characters)" });

    const result = await dbQuery("UPDATE images SET original_name = ? WHERE id = ?", [
      name,
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Image not found" });

    const [image] = await dbQuery("SELECT * FROM images WHERE id = ?", [req.params.id]);
    res.json({
      success: true,
      message: "Image renamed",
      image: { ...image, url: image.file_url },
    });
  } catch (err) {
    console.error("DB error renaming image:", err.message);
    res.status(500).json({ success: false, message: "Failed to rename image" });
  }
});

// Removes the library entry. The physical file stays on Hostinger (upload.php
// exposes no delete endpoint), so blogs already pointing at the URL keep working.
app.delete("/api/images/:id", verifyToken, async (req, res) => {
  try {
    await dbQuery("DELETE FROM images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Image removed from library" });
  } catch (err) {
    console.error("DB error deleting image:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
});

// ================= SHARED: parse a pasted URL list =================
// Used by both the Portfolio and Dome Gallery bulk endpoints so the two behave
// identically: trim, drop blanks, reject non-http(s) lines, and de-duplicate
// within the pasted list itself.
const parseUrlList = (raw) => {
  const lines = Array.isArray(raw) ? raw : String(raw || "").split(/\r?\n/);
  const seen = new Set();
  const invalid = [];
  const urls = [];
  let repeated = 0;

  for (const line of lines) {
    const url = String(line || "").trim();
    if (!url) continue;
    if (!/^https?:\/\/\S+$/i.test(url)) { invalid.push(url); continue; }
    if (seen.has(url)) { repeated += 1; continue; }
    seen.add(url);
    urls.push(url);
  }

  return { urls, invalid, repeated };
};

// ================= PORTFOLIO API =================
// Public read — the Portfolio page fetches this instead of hardcoding images.
app.get("/api/portfolio", async (req, res) => {
  try {
    const { category } = req.query;
    const where = category && category !== "all" ? "WHERE category = ?" : "";
    const params = where ? [category] : [];

    const items = await dbQuery(
      `SELECT * FROM portfolio_images ${where} ORDER BY category ASC, sort_order ASC, id ASC`,
      params
    );
    res.json({ success: true, items: await attachImageVariants(items) });
  } catch (err) {
    console.error("DB error fetching portfolio:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch portfolio images" });
  }
});

/**
 * Bulk add / replace a category from a list of pasted URLs.
 *
 * body: { category, urls: string[], mode: "append" | "replace", title?, description? }
 *
 * mode "append"  — adds the new URLs after the existing ones
 * mode "replace" — wipes the category first, then inserts
 *
 * Duplicates are skipped in both directions: repeats inside the pasted list,
 * and URLs already stored in that category.
 */
app.post("/api/portfolio/bulk", verifyToken, async (req, res) => {
  try {
    const category = String(req.body.category || "").trim().toLowerCase();
    const mode = req.body.mode === "replace" ? "replace" : "append";

    if (!PORTFOLIO_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Unknown category. Use one of: ${PORTFOLIO_CATEGORIES.join(", ")}`,
      });
    }

    const { urls, invalid, repeated } = parseUrlList(req.body.urls);

    if (urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: invalid.length
          ? "No valid URLs found — each line must start with http:// or https://"
          : "Paste at least one image URL.",
      });
    }

    if (mode === "replace") {
      await dbQuery("DELETE FROM portfolio_images WHERE category = ?", [category]);
    }

    const existing = await dbQuery(
      "SELECT image_url FROM portfolio_images WHERE category = ?",
      [category]
    );
    const already = new Set(existing.map((r) => r.image_url));

    const [{ maxOrder }] = await dbQuery(
      "SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM portfolio_images WHERE category = ?",
      [category]
    );

    const now = Date.now();
    const title = String(req.body.title || "").trim() || null;
    const description = String(req.body.description || "").trim() || null;

    let order = Number(maxOrder) + 1;
    const rows = [];
    // Count both kinds of duplicate — repeats inside the paste AND URLs already
    // stored — so the reported number matches what the admin actually pasted.
    let skipped = repeated;
    for (const url of urls) {
      if (already.has(url)) { skipped += 1; continue; }
      rows.push([category, url, title, description, order++, now, now]);
    }

    if (rows.length > 0) {
      await dbQuery(
        `INSERT IGNORE INTO portfolio_images
           (category, image_url, title, description, sort_order, created_at, updated_at)
         VALUES ?`,
        [rows]
      );
    }

    const items = await dbQuery(
      "SELECT * FROM portfolio_images WHERE category = ? ORDER BY sort_order ASC, id ASC",
      [category]
    );

    res.json({
      success: true,
      message: `${rows.length} image${rows.length === 1 ? "" : "s"} added${skipped ? `, ${skipped} duplicate skipped` : ""}`,
      added: rows.length,
      skipped,
      invalid,
      items,
    });
  } catch (err) {
    console.error("DB error bulk-saving portfolio:", err.message);
    res.status(500).json({ success: false, message: "Failed to update portfolio" });
  }
});

// Reorder — declared BEFORE /:id so "reorder" is never read as an id
app.put("/api/portfolio/reorder", verifyToken, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
    if (ids.length === 0)
      return res.status(400).json({ success: false, message: "No image order provided" });

    const now = Date.now();
    await Promise.all(
      ids.map((id, index) =>
        dbQuery("UPDATE portfolio_images SET sort_order = ?, updated_at = ? WHERE id = ?", [index, now, id])
      )
    );
    res.json({ success: true, message: "Order saved" });
  } catch (err) {
    console.error("DB error reordering portfolio:", err.message);
    res.status(500).json({ success: false, message: "Failed to save the new order" });
  }
});

// Edit a single entry (URL, title or description)
app.put("/api/portfolio/:id", verifyToken, async (req, res) => {
  try {
    const url = String(req.body.image_url || "").trim();
    if (!/^https?:\/\/\S+$/i.test(url))
      return res.status(400).json({ success: false, message: "Enter a valid http:// or https:// image URL." });

    const result = await dbQuery(
      "UPDATE portfolio_images SET image_url = ?, title = ?, description = ?, updated_at = ? WHERE id = ?",
      [
        url,
        String(req.body.title || "").trim() || null,
        String(req.body.description || "").trim() || null,
        Date.now(),
        req.params.id,
      ]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Portfolio image not found" });

    const [item] = await dbQuery("SELECT * FROM portfolio_images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Portfolio image updated", item });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "That URL is already in this category." });
    console.error("DB error updating portfolio image:", err.message);
    res.status(500).json({ success: false, message: "Failed to update the image" });
  }
});

app.delete("/api/portfolio/:id", verifyToken, async (req, res) => {
  try {
    await dbQuery("DELETE FROM portfolio_images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Portfolio image removed" });
  } catch (err) {
    console.error("DB error deleting portfolio image:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete the image" });
  }
});

// ================= DOME GALLERY API =================
// Public read — DomeGallery.jsx fetches this instead of holding a hardcoded list.
app.get("/api/gallery", async (req, res) => {
  try {
    const items = await dbQuery(
      "SELECT * FROM gallery_images ORDER BY sort_order ASC, id ASC"
    );
    res.json({ success: true, items: await attachImageVariants(items) });
  } catch (err) {
    console.error("DB error fetching gallery:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch gallery images" });
  }
});

/**
 * Bulk add / replace the dome gallery.
 * body: { urls: string[] | string, mode: "append" | "replace", alt? }
 */
app.post("/api/gallery/bulk", verifyToken, async (req, res) => {
  try {
    const mode = req.body.mode === "replace" ? "replace" : "append";
    const { urls, invalid, repeated } = parseUrlList(req.body.urls);

    if (urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: invalid.length
          ? "No valid URLs found — each line must start with http:// or https://"
          : "Paste at least one image URL.",
      });
    }

    if (mode === "replace") {
      await dbQuery("DELETE FROM gallery_images");
    }

    const existing = await dbQuery("SELECT image_url FROM gallery_images");
    const already = new Set(existing.map((r) => r.image_url));

    const [{ maxOrder }] = await dbQuery(
      "SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM gallery_images"
    );

    const now = Date.now();
    const alt = String(req.body.alt || "").trim() || null;

    let order = Number(maxOrder) + 1;
    const rows = [];
    let skipped = repeated;
    for (const url of urls) {
      if (already.has(url)) { skipped += 1; continue; }
      rows.push([url, alt, order++, now, now]);
    }

    if (rows.length > 0) {
      await dbQuery(
        "INSERT IGNORE INTO gallery_images (image_url, alt, sort_order, created_at, updated_at) VALUES ?",
        [rows]
      );
    }

    const items = await dbQuery(
      "SELECT * FROM gallery_images ORDER BY sort_order ASC, id ASC"
    );

    res.json({
      success: true,
      message: `${rows.length} image${rows.length === 1 ? "" : "s"} added${skipped ? `, ${skipped} duplicate skipped` : ""}`,
      added: rows.length,
      skipped,
      invalid,
      items,
    });
  } catch (err) {
    console.error("DB error bulk-saving gallery:", err.message);
    res.status(500).json({ success: false, message: "Failed to update the gallery" });
  }
});

// Reorder — must be declared BEFORE /:id
app.put("/api/gallery/reorder", verifyToken, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
    if (ids.length === 0)
      return res.status(400).json({ success: false, message: "No image order provided" });

    const now = Date.now();
    await Promise.all(
      ids.map((id, index) =>
        dbQuery("UPDATE gallery_images SET sort_order = ?, updated_at = ? WHERE id = ?", [index, now, id])
      )
    );
    res.json({ success: true, message: "Order saved" });
  } catch (err) {
    console.error("DB error reordering gallery:", err.message);
    res.status(500).json({ success: false, message: "Failed to save the new order" });
  }
});

app.put("/api/gallery/:id", verifyToken, async (req, res) => {
  try {
    const url = String(req.body.image_url || "").trim();
    if (!/^https?:\/\/\S+$/i.test(url))
      return res.status(400).json({ success: false, message: "Enter a valid http:// or https:// image URL." });

    const result = await dbQuery(
      "UPDATE gallery_images SET image_url = ?, alt = ?, updated_at = ? WHERE id = ?",
      [url, String(req.body.alt || "").trim() || null, Date.now(), req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Gallery image not found" });

    const [item] = await dbQuery("SELECT * FROM gallery_images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Gallery image updated", item });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "That URL is already in the gallery." });
    console.error("DB error updating gallery image:", err.message);
    res.status(500).json({ success: false, message: "Failed to update the image" });
  }
});

app.delete("/api/gallery/:id", verifyToken, async (req, res) => {
  try {
    await dbQuery("DELETE FROM gallery_images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Gallery image removed" });
  } catch (err) {
    console.error("DB error deleting gallery image:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete the image" });
  }
});

// ================= CREATE BLOG =================
app.post("/api/blogs", verifyToken, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      // Upload temp file to Hostinger, get back full HTTPS URL (also registered
      // in the images library so it can be reused by other blogs later)
      const image = await uploadAndRegisterImage(req.file, {
        width: req.body.width,
        height: req.body.height,
        source: "blog",
      });
      imageUrl = image.url;
    } else if (req.body.existingImage && req.body.existingImage.trim() !== "") {
      // ✅ Image picked from the library — reuse the already-hosted URL,
      //    no second copy of the file is created
      imageUrl = req.body.existingImage.trim();
    }

    const sql = `
      INSERT INTO blogs 
      (title, permalink, metaDescription, description, category, image, keywords, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        req.body.title,
        req.body.permalink,
        req.body.metaDescription,
        req.body.description,
        req.body.category,
        imageUrl,
        req.body.keywords,
        req.body.status,
        Date.now(),
        Date.now(),
      ],
      (err) => {
        if (err) {
          console.error("DB error creating blog:", err);
          return res.status(500).json({ success: false, message: "Failed to create blog" });
        }
        res.json({ success: true, message: "Blog created" });
      }
    );
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= GET PUBLIC BLOGS =================
app.get("/api/blogs", (req, res) => {
  db.query("SELECT * FROM blogs WHERE status = 'published' ORDER BY createdAt DESC", async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch blogs" });

    const blogs = results.map((blog) => ({
      ...blog,
      image: getImageUrl(blog.image),
    }));

    // Blog images are no longer in the shipped manifest — it now carries only
    // the URLs hardcoded in the JSX — so the responsive variants have to ride
    // along with the data instead. One IN() query, same as gallery/portfolio.
    res.json(await attachImageVariants(blogs, "image"));
  });
});

// ================= GET ALL BLOGS (ADMIN) =================
app.get("/api/admin/blogs", verifyToken, (req, res) => {
  db.query("SELECT * FROM blogs ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch blogs" });

    const blogs = results.map((blog) => ({
      ...blog,
      image: getImageUrl(blog.image),
    }));

    res.json(blogs);
  });
});

// ================= GET SINGLE BLOG BY SLUG =================
app.use("/api/blog", (req, res) => {
  const slug = req.path.replace(/^\//, "");
  if (!slug)
    return res.status(404).json({ success: false, message: "No slug provided" });

  db.query("SELECT * FROM blogs WHERE permalink = ?", [slug], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ success: false, message: "Blog not found" });

    const blog = { ...result[0], image: getImageUrl(result[0].image) };
    // The hero image here is the blog page's LCP element, so it needs its
    // variants and LQIP attached rather than falling back to the original.
    const [withVariants] = await attachImageVariants([blog], "image");
    res.json(withVariants);
  });
});

// ================= UPDATE BLOG =================
app.put("/api/blogs/:id", verifyToken, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const {
    title,
    permalink,
    metaDescription,
    description,
    category,
    keywords,
    status,
    existingImage, // ✅ sent by frontend when no new file is chosen — preserve current image
  } = req.body;

  try {
    let imageUrl;

    if (req.file) {
      // ✅ FIX: New file uploaded → send it to Hostinger upload.php, get full HTTPS URL
      // Previously this was storing a local /uploads/ path which broke on Hostinger
      const image = await uploadAndRegisterImage(req.file, {
        width: req.body.width,
        height: req.body.height,
        source: "blog",
      });
      imageUrl = image.url;
    } else if (existingImage && existingImage.trim() !== "") {
      // ✅ No new file, but frontend passed the current image URL → keep it
      imageUrl = existingImage.trim();
    } else {
      // No file, no existingImage → user intentionally removed the image
      imageUrl = null;
    }

    const sql = `
      UPDATE blogs SET
        title = ?,
        permalink = ?,
        metaDescription = ?,
        description = ?,
        category = ?,
        keywords = ?,
        status = ?,
        image = ?,
        updatedAt = ?
      WHERE id = ?
    `;

    const values = [
      title,
      permalink,
      metaDescription,
      description,
      category,
      keywords,
      status,
      imageUrl,   // ✅ always explicitly set — no conditional column building
      Date.now(),
      id,
    ];

    db.query(sql, values, (err) => {
      if (err) {
        console.error("DB error updating blog:", err);
        return res.status(500).json({ success: false, message: "Failed to update blog" });
      }
      res.json({ success: true, message: "Blog updated" });
    });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ success: false, message: "Server error uploading image" });
  }
});

// ================= DELETE BLOG =================
app.delete("/api/blogs/:id", verifyToken, (req, res) => {
  db.query("SELECT image FROM blogs WHERE id = ?", [req.params.id], (err, result) => {
    // Note: images are stored on Hostinger, not locally, so local file deletion is skipped
    // If you want to also delete from Hostinger you'd need a delete endpoint on upload.php

    db.query("DELETE FROM blogs WHERE id = ?", [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: "Failed to delete blog" });
      res.json({ success: true, message: "Blog deleted" });
    });
  });
});

// ================= OG SHARE PREVIEW =================
// When a blog link is shared on WhatsApp / Twitter / LinkedIn / Telegram etc.,
// social crawlers hit this URL, read the OG meta tags, and render the preview card.
// Regular human visitors are instantly JS-redirected to the actual React blog page.
//
// Share URL format:  https://<your-backend-domain>/share/<permalink>
// Example:           https://api.geniestudio.in/share/services/my-blog-post
//
// In AdminBlogs.jsx the "Copy Share Link" button copies exactly this URL.

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
// ================= OG SHARE PREVIEW =================
app.use("/share/", (req, res) => {
  const permalink = req.path.replace(/^\//, "");
  if (!permalink) return res.redirect("https://geniestudio.in");

  db.query(
    "SELECT title, metaDescription, image, permalink FROM blogs WHERE permalink = ?",
    [permalink],
    (err, result) => {
      if (err || result.length === 0) {
        return res.redirect("https://geniestudio.in/blog");
      }
      const blog        = result[0];
      const title       = escapeHtml(blog.title || "GenieStudio Blog");
      const description = escapeHtml(blog.metaDescription || "Read this article on GenieStudio");
      const image       = escapeHtml(blog.image || "https://geniestudio.in/og-default.jpg");
      const pageUrl     = `https://geniestudio.in/blog/${blog.permalink}`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type"        content="article" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image"       content="${image}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url"         content="${pageUrl}" />
  <meta property="og:site_name"   content="GenieStudio" />
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${image}" />
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body style="margin:0;background:#1a1a1a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
  <div>
    <p style="font-size:14px;color:#aaa;margin-bottom:12px;">Redirecting you to the article…</p>
    <a href="${pageUrl}" style="color:#D4B49A;font-size:16px;font-weight:bold;">${title}</a>
  </div>
  <script>window.location.replace("${pageUrl}");</script>
</body>
</html>`);
    }
  );
});

// ================= ERROR HANDLER =================
// Keeps upload failures (multer size / type rejections) as JSON so the frontend
// can show the right message instead of choking on an HTML error page.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.error("Request error:", err.message);

  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(413).json({ success: false, message: "Image size must be less than 5 MB." });

  if (err.message === "Only images are allowed")
    return res
      .status(415)
      .json({ success: false, message: "Please upload a JPG, JPEG, PNG, or WebP image." });

  res.status(500).json({ success: false, message: err.message || "Server error" });
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 Open: http://localhost:${PORT}`);
});