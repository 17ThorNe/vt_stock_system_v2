const fastify = require("fastify")({ logger: true });
const knex = require("./config/knex.js");
const userRoutes = require("./routes/user.route.js");
require("dotenv").config();
const levelsRoutes = require("./routes/levels.route.js");

fastify.register(userRoutes, { prefix: "/stock_system/api/v2" });
fastify.register(levelsRoutes, { prefix: "/stock_system/api/v2" });

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`🚀 Server running at http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
