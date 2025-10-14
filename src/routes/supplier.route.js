const supplierController = require("../controller/supplier.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");

async function supplierRoutes(fastify, option) {
  fastify.post(
    "/create-supplier",
    { preHandler: [verifyApiKey, JWTAuth] },
    supplierController.createSupplier
  );
  fastify.get(
    "/getall-supplier",
    { preHandler: [verifyApiKey, JWTAuth] },
    supplierController.getAllSupplier
  );
}

module.exports = supplierRoutes;
