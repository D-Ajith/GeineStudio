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
  const url = await uploadToHostinger(file.path);
  if (!url) throw new Error("Upload service did not return a URL");

  const filename = String(url).split("/").pop().split("?")[0];
  const record = {
    id: null,
    filename,
    original_name: file.originalname || filename,
    url,
    file_url: url,
    file_path: `public_html/uploads/${filename}`,
    mime_type: file.mimetype || null,
    file_size: file.size || null,
    width: Number(meta.width) || null,
    height: Number(meta.height) || null,
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
        (filename, original_name, file_url, file_path, mime_type, file_size, width, height, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.filename,
        record.original_name,
        record.file_url,
        record.file_path,
        record.mime_type,
        record.file_size,
        record.width,
        record.height,
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
      images: images.map((img) => ({ ...img, url: img.file_url })),
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
  db.query("SELECT * FROM blogs WHERE status = 'published' ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch blogs" });

    const blogs = results.map((blog) => ({
      ...blog,
      image: getImageUrl(blog.image),
    }));

    res.json(blogs);
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

  db.query("SELECT * FROM blogs WHERE permalink = ?", [slug], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ success: false, message: "Blog not found" });

    const blog = { ...result[0], image: getImageUrl(result[0].image) };
    res.json(blog);
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