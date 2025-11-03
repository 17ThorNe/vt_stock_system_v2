// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql2", // <-- Use mysql2 instead of sqlite3
    connection: {
      host: "127.0.0.1",
      user: "root",
      password: "@#$Mysql151100&!", // <-- Add your MySQL root password if any
      database: "vertex_stock_database", // <-- Your database name
    },
    pool: { min: 0, max: 10 },
    migrations: {
      tableName: "knex_migrations", // <-- Keep track of migrations
      directory: "./src/migration", // <-- Make sure your migration files are here
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
