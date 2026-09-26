// TrustLink — minimal working signup prototype (TRL 3 proof of concept)
// Swap better-sqlite3 for pg (PostgreSQL/Supabase) later without changing the API shape.

const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 4000;

// --- Database setup ---
const db = new Database(path.join(__dirname, "trustlink.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK(role IN ('customer', 'vendor')),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    business_name TEXT,
    location TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// --- POST /api/signup — actually writes to the database ---
app.post("/api/signup", (req, res) => {
  const { role, name, email, businessName, location } = req.body;

  if (!role || !name || !email) {
    return res.status(400).json({ error: "role, name and email are required." });
  }
  if (!["customer", "vendor"].includes(role)) {
    return res.status(400).json({ error: "role must be 'customer' or 'vendor'." });
  }
  if (role === "vendor" && !businessName) {
    return res.status(400).json({ error: "businessName is required for vendors." });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO users (role, name, email, business_name, location)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(role, name, email, businessName || null, location || null);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    return res.status(201).json({ message: "Signup successful.", user });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "An account with that email already exists." });
    }
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT id, role, name, email, business_name, location, created_at FROM users ORDER BY id DESC").all();
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`TrustLink signup prototype running at http://localhost:${PORT}`);
});
