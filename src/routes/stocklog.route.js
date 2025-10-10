const stockLogController = require("../controller/stocklog.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function stockLogRoutes(fastify, option) {
  fastify.get(
    "/get-stocklog",
    { preHandler: [JWTAuth] },
    stockLogController.getAllStockLog
  );
}

module.exports = stockLogRoutes;
