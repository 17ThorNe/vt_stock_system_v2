console.log("Running test-db.js...");

const knex = require("./config/knex"); // path to knex config

async function test() {
  try {
    const [rows] = await knex.raw("SELECT 1+1 AS result"); // await result
    console.log("✅ DB connected successfully:", rows);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  } finally {
    await knex.destroy(); // close connection
    process.exit();
  }
}

test();
