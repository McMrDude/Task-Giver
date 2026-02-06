import express from "express";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
import pgSession from "connect-pg-simple";

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

/* ----------- FIX __dirname FOR ES MODULES ----------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ DATABASE ------------------ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query("SELECT NOW()")
  .then(res => {
    console.log("✅ Database connected:", res.rows[0]);
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
  });

const PgSession = pgSession(session);

const sessionStore = new PgSession({
  pool: pool,
  tableName: "session"
});

/* ------------------ MIDDLEWARE ------------------ */
app.use(express.json()); 

/* Serve React build folder in production */
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  })
);

/* ------------------ ROUTES ------------------ */

// API route (JSON)
app.get("/api/messages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.json(null);
  }
  res.json(req.session.user);
});


// Create a new user (example)
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered, login instead" });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, name, email`,
      [name, email, hash]
    );

    req.session.user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
    };

    res.json({ message: "Registered and logged in" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.json({ message: "Logged in", user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* Catch-all to serve React in production */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

/* ------------------ START SERVER ------------------ */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 