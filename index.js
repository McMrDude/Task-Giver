const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/messages", async (req, res) => {
  const result = await pool.query("select * from messages");
  res.json(result.rows);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});