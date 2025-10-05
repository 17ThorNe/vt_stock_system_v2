const orderController = require("../controller/order.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function orderRoutes(fastify, option) {
  fastify.post(
    "/create-order",
    { preHandler: [JWTAuth] },
    orderController.createOrder
  );
  fastify.get(
    "/get-order",
    { preHandler: [JWTAuth] },
    orderController.getAllOrders
  );
  fastify.get(
    "/get-order/:id",
    { preHandler: [JWTAuth] },
    orderController.getOrderById
  );
  fastify.put(
    "/update-order/:id",
    { preHandler: [JWTAuth] },
    orderController.updateOrder
  );
  fastify.put(
    "/approve-reject-order/:id",
    { preHandler: [JWTAuth] },
    orderController.inventoryManagerApproveOrReject
  );
  fastify.put(
    "/delete-order/:id",
    { preHandler: [JWTAuth] },
    orderController.deleteOrder
  );
  fastify.post(
    "/post-test-order",
    { preHandler: [JWTAuth] },
    orderController.postTestRole
  );
}

module.exports = orderRoutes;
