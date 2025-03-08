const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Save winner to database
app.post("/save-winner", async (req, res) => {
  const { player } = req.body;
  if (!player) return res.status(400).json({ message: "Player is required" });

  try {
    const existingWinner = await pool.query("SELECT * FROM winners WHERE player = $1", [player]);

    if (existingWinner.rows.length > 0) {
      await pool.query("UPDATE winners SET wins = wins + 1 WHERE player = $1", [player]);
    } else {
      await pool.query("INSERT INTO winners (player, wins) VALUES ($1, 1)", [player]);
    }

    res.json({ message: "Winner saved successfully!" });
  } catch (error) {
    console.error("Error saving winner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query('SELECT player, wins from winners ORDER BY wins DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
