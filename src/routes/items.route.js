const itemsController = require("../controller/items.controller.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function orderItemRoutes(fastify, option) {
  fastify.post(
    "/create-order-item",
    { preHandler: [verifyApiKey, JWTAuth] },
    itemsController.createItems
  );
  fastify.get(
    "/get-order-item",
    { preHandler: [verifyApiKey, JWTAuth] },
    itemsController.getAllItems
  );
  fastify.get(
    "/get-order-item/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    itemsController.getItemById
  );
  fastify.get(
    "/get-order-item-staff/:staff_id",
    { preHandler: [JWTAuth] },
    itemsController.getItemByStaffId
  );
  fastify.get(
    "/get-order-item-orderid/:id",
    { preHandler: [JWTAuth] },
    itemsController.getItemByOrderId
  );
  fastify.put(
    "/update-order-item/:id",
    { preHandler: [JWTAuth] },
    itemsController.updateItems
  );
  fastify.put(
    "/delete-order-item/:id",
    { preHandler: [JWTAuth] },
    itemsController.deleteItem
  );
}

module.exports = orderItemRoutes;
