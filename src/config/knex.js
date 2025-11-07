require("dotenv").config();
const hostname = process.env.HOST_DATABASE;
const knex = require("knex")({
  client: "mysql2",
  connection: {
    // host: "127.0.0.1",
    host: hostname,
    user: "stock_database",
    password: "@#$Mysql151100&!",
    database: "vertex_stock_database",
  },
  pool: { min: 0, max: 10 },
});

module.exports = knex;
