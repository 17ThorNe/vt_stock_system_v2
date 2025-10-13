const knex = require("knex")({
  client: "mysql2",
  connection: {
    // host: "localhost",
    host: "host.docker.internal",
    user: "root",
    password: "",
    database: "stock_database",
  },
  pool: { min: 0, max: 10 },
});

async function validateConnection() {
  try {
    await knex.raw("SELECT 1+1 AS result");
    // console.log("Database connection is OK!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

validateConnection();

module.exports = knex;
