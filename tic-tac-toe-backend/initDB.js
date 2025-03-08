const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE winners (
        id SERIAL PRIMARY KEY,
        player VARCHAR(10) NOT NULL,
        wins INT DEFAULT 1
    );

    `);
    console.log("Database schema created successfully.");
  } catch (error) {
    console.error("Error creating database schema:", error);
    process.exit(1);
  } finally {
    pool.end();
  }
};

createTable();
