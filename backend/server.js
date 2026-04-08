require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(
  cors({
    origin: "https://geniestudio.in",
    credentials: true,
  })
);app.use(express.json());

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
  if (err) {
    console.log("❌ DB ERROR:", err);
  } else {
    console.log("✅ DB Connected Stable");
  }
});

// ================= MULTER =================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================= JWT MIDDLEWARE =================
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json({ message: "No token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
};

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM admins WHERE email=?", [email], async (err, result) => {
    if (result.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = result[0];

    // compare password
    if (password !== user.password) {
      return res.json({ success: false, message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ success: true, token });
  });
});

// ================= CREATE BLOG =================
app.post("/api/blogs", verifyToken, upload.single("image"), (req, res) => {
  const {
    title,
    permalink,
    metaDescription,
    description,
    category,
    keywords,
    status,
  } = req.body;

  const image = req.file ? req.file.buffer : null;
  const imageType = req.file ? req.file.mimetype : null;

  const sql = `
    INSERT INTO blogs 
    (title, permalink, metaDescription, description, category, image, imageType, keywords, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      permalink,
      metaDescription,
      description,
      category,
      image,
      imageType,
      keywords,
      status,
      Date.now(),
      Date.now(),
    ],
    (err) => {
      if (err) return res.json(err);
      res.json({ message: "Blog created" });
    }
  );
});

// ================= GET BLOGS =================
app.get("/api/blogs", (req, res) => {
  db.query("SELECT * FROM blogs WHERE status='published'", (err, results) => {
    if (err) return res.json(err);

    const blogs = results.map((blog) => {
      if (blog.image) {
        blog.image = `data:${blog.imageType};base64,${blog.image.toString("base64")}`;
      }
      return blog;
    });

    res.json(blogs);
  });
});

// ================= GET SINGLE BLOG BY SLUG =================
app.use("/api/blog", (req, res) => {
  // req.path = "/corporate-shoots/my-blog-title"
  const slug = req.path.replace(/^\//, ""); // strip leading slash


  if (!slug) return res.status(404).json({ message: "No slug provided" });

  db.query("SELECT * FROM blogs WHERE permalink=?", [slug], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Blog not found" });
    let blog = result[0];
    if (blog.image) blog.image = `data:${blog.imageType};base64,${blog.image.toString("base64")}`;
    res.json(blog);
  });
});
// Add this after your existing GET /api/blogs route
app.get("/api/admin/blogs", verifyToken, (req, res) => {
  db.query("SELECT * FROM blogs ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.json(err);
    const blogs = results.map((blog) => {
      if (blog.image) {
        blog.image = `data:${blog.imageType};base64,${blog.image.toString("base64")}`;
      }
      return blog;
    });
    res.json(blogs);
  });
});
// ================= UPDATE BLOG =================
app.put("/api/blogs/:id", verifyToken, upload.single("image"), (req, res) => {
  const { id } = req.params;

  const {
    title,
    permalink,
    metaDescription,
    description,
    category,
    keywords,
    status,
  } = req.body;

  const image = req.file ? req.file.buffer : null;
  const imageType = req.file ? req.file.mimetype : null;

  let sql = `
    UPDATE blogs SET 
    title=?, permalink=?, metaDescription=?, description=?, category=?, keywords=?, status=?, updatedAt=?
  `;

  let values = [
    title,
    permalink,
    metaDescription,
    description,
    category,
    keywords,
    status,
    Date.now(),
  ];

  if (image) {
    sql += ", image=?, imageType=?";
    values.push(image, imageType);
  }

  sql += " WHERE id=?";
  values.push(id);

  db.query(sql, values, (err) => {
    if (err) return res.json(err);
    res.json({ message: "Blog updated" });
  });
});
// ================= DELETE BLOG =================
app.delete("/api/blogs/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM blogs WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json(err);
    res.json({ message: "Deleted" });
  });
});
// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 GenieStudio Backend is Working!");
});
// ================= START =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 Open: http://localhost:${PORT}`);
});
