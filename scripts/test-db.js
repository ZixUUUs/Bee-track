require("dotenv").config();
const pool = require("../src/config/db");

(async () => {
  try {
    const r = await pool.query(
      "select current_user, current_database(), now()",
    );
    console.log("✅ DB OK:", r.rows[0]);
  } catch (e) {
    console.error("❌ DB FAIL:", e.message);
  } finally {
    await pool.end();
  }
})();
