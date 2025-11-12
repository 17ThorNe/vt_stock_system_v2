const stockLogController = require("../controller/stocklog.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");

async function stockLogRoutes(fastify, option) {
  fastify.get(
    "/get-stocklog",
    { preHandler: [verifyApiKey, JWTAuth] },
    stockLogController.getAllStockLog
  );
  fastify.post(
    "/import-stocklog",
    { preHandler: [verifyApiKey, JWTAuth] },
    stockLogController.importStock
  );
  fastify.get(
    "/stocklog/stats",
    { preHandler: [verifyApiKey, JWTAuth] },
    stockLogController.stockLogStats
  );
  fastify.post(
    "/re-stocklog",
    { preHandler: [verifyApiKey, JWTAuth] },
    stockLogController.addStock
  );
}

module.exports = stockLogRoutes;
