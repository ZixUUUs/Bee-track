const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },

  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PG error", err.message);
});

module.exports = pool;
