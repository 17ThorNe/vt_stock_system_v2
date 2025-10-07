const path = require("path");
const fastify = require("fastify")({ logger: false });
const knex = require("./config/knex.js");
require("dotenv").config();

const userRoutes = require("./routes/user.route.js");
const levelsRoutes = require("./routes/levels.route.js");
const staffRoutes = require("./routes/staff.route.js");
const categoryRoutes = require("./routes/categories.route.js");
const productRoutes = require("./routes/product.route.js");
const customerRoutes = require("./routes/customer.route.js");
const orderRoutes = require("./routes/order.route.js");
const uploadRoutes = require("./routes/upload.route.js");
const orderItemRoutes = require("./routes/orderItems.route.js");

fastify.register(require("@fastify/multipart"));

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "uploads"),
  prefix: "/uploads/",
});

const prefix = "/stock_system/api/v2";
fastify.register(userRoutes, { prefix });
fastify.register(levelsRoutes, { prefix });
fastify.register(staffRoutes, { prefix });
fastify.register(categoryRoutes, { prefix });
fastify.register(productRoutes, { prefix });
fastify.register(customerRoutes, { prefix });
fastify.register(orderRoutes, { prefix });
fastify.register(uploadRoutes, { prefix });
fastify.register(orderItemRoutes, { prefix });

const start = async () => {
  try {
    fastify.listen({ port: process.env.PORT || 3000 });
    console.log(
      `🚀 Server running at http://localhost:${process.env.PORT || 3000}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
