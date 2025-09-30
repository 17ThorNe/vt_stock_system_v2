const fastify = require("fastify")({ logger: true });
const knex = require("./config/knex.js");
const userRoutes = require("./routes/user.route.js");
require("dotenv").config();
const levelsRoutes = require("./routes/levels.route.js");
const staffRoutes = require("./routes/staff.route.js");
const categoryRoutes = require("./routes/categories.route.js");
const productRoutes = require("./routes/product.route.js");
const customerRoutes = require("./routes/customer.route.js");

fastify.register(userRoutes, { prefix: "/stock_system/api/v2" });
fastify.register(levelsRoutes, { prefix: "/stock_system/api/v2" });
fastify.register(staffRoutes, { prefix: "/stock_system/api/v2" });
fastify.register(categoryRoutes, { prefix: "/stock_system/api/v2" });
fastify.register(productRoutes, { prefix: "/stock_system/api/v2" });
fastify.register(customerRoutes, { prefix: "/stock_system/api/v2" });

const start = async () => {
  try {
    fastify.listen({ port: process.env.PORT });
    console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
