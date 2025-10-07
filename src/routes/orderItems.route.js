const orderItemController = require("../controller/orderItems.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function orderItemRoutes(fastify, option) {
  fastify.post(
    "/create-order-item",
    { preHandler: [JWTAuth] },
    orderItemController.createOrderItems
  );
}

module.exports = orderItemRoutes;
