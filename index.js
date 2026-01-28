import express from "express";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 3000;

/* ----------- FIX __dirname FOR ES MODULES ----------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ DATABASE ------------------ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ------------------ MIDDLEWARE ------------------ */
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

/* ------------------ ROUTES ------------------ */

// Home page (HTML)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

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

/* ------------------ START SERVER ------------------ */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
