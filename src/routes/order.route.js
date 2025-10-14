const orderController = require("../controller/order.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");

async function orderRoutes(fastify, option) {
  fastify.post(
    "/create-order",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.createOrder
  );
  fastify.get(
    "/get-order",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.getAllOrders
  );
  fastify.get(
    "/get-order/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.getOrderById
  );
  fastify.put(
    "/update-order/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.updateOrder
  );
  fastify.put(
    "/approve-reject-order/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.inventoryManagerApproveOrReject
  );
  fastify.put(
    "/delete-order/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.deleteOrder
  );
  fastify.post(
    "/post-test-order",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.postTestRole
  );
  fastify.put(
    "/finance-approve-order/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.financeApprovePayment
  );
  fastify.put(
    "/delivery-approve-order/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.deliveryApprove
  );
  fastify.get(
    "/finance-get-approve",
    { preHandler: [verifyApiKey, JWTAuth] },
    orderController.financeGetOrderApproved
  );
}

module.exports = orderRoutes;
