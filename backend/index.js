import express from "express";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
import pgSession from "connect-pg-simple";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));

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


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ------------------ MIDDLEWARE ------------------ */
app.set("trust proxy", 1);

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    }
  })
);


app.use(express.json()); 

/* Serve React build folder in production */
app.use(express.static(path.join(__dirname, "../frontend/dist")));

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

app.post("/api/tasks", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const { receiverId, title, content, due_date, priority } = req.body;

    if (!receiverId || !title || !content || !due_date || !priority) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await pool.query(
      `INSERT INTO tasks (sender_id, receiver_id, title, content, due_date, priority)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.session.user.id, receiverId, title, content, due_date, priority]
    );

    res.json({ task: "tasks sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send tasks" });
  }
});

app.get("/api/my-tasks", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const result = await pool.query(
      `SELECT m.*, u.name as sender_name
       FROM tasks m
       JOIN users u ON m.sender_id = u.id
       WHERE receiver_id = $1
       ORDER BY created_at DESC`,
      [req.session.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.get("/api/sent-tasks", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const result = await pool.query(
      `SELECT t.*, u.name as receiver_name
       FROM tasks t
       JOIN users u ON t.receiver_id = u.id
       WHERE sender_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [req.session.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sent tasks" });
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
  console.log("SESSION SECRET:", process.env.SESSION_SECRET);
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

app.put("/api/tasks/:id/status", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

     const { id } = req.params;
     const { status } = req.body;

     await pool.query(
      `UPDATE tasks
      SET status = $1
      WHERE id = $2 AND receiver_id = $3`,
      [status, id, req.session.user.id]
     );

     res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});


app.use("/images", express.static("images"));

const images = [
  "https://https://task-giver-xsin.onrender.com//images/reset1.png",
  "https://https://task-giver-xsin.onrender.com//images/reset2.png",
  "https://https://task-giver-xsin.onrender.com//images/reset3.png",
  "https://https://task-giver-xsin.onrender.com//images/reset4.png",
  "https://https://task-giver-xsin.onrender.com//images/reset5.png"
];

const randomImage = images[Math.floor(Math.random() * images.length)];

app.post("/api/request-reset", async (req, res) => {
  const { email } = req.body;

  const result = await pool.query(
    "SELECT id FROM users WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.json({
      message: "If an account exists, a reset link has been sent."
    });
  }

  const userId = result.rows[0].id;

  const token = crypto.randomBytes(32).toString("hex");

  await pool.query(
    `INSERT INTO password_resets (user_id, token, expires_at)
    VALUES ($1,$2,NOW() + INTERVAL '1 hour')`,
    [userId, token]
  );

  const resetLink = `https://task-giver-xsin.onrender.com/reset-password/${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your password",
    html: `
    <p>You want to change your password huh? What, you gone and lost it? It went out to buy milk like your dad?</p>
    
    <p>Well here you go sport, click this link to reset your password champ:</p>
    
    <a href="${resetLink}">${resetLink}</a>

    <img src="cid:resetimages" style="width:300px;">
    `,
    attachments: [
      {
        filename: "reset.png",
        path: randomImage,
        cid: "resetimage"
      }
    ]
  });

  res.json({
    message: "If an account exists, a reset link has been sent."
  });
});

/* Catch-all to serve React in production */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

/* ------------------ START SERVER ------------------ */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 