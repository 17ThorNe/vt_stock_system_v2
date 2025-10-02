const orderController = require("../controller/order.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function orderRoutes(fastify, option) {
  fastify.post(
    "/create-order",
    { preHandler: [JWTAuth] },
    orderController.createOrder
  );
}

module.exports = orderRoutes;
