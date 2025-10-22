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
}

module.exports = stockLogRoutes;
