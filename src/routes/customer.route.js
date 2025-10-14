const customerController = require("../controller/customer.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");
async function customerRoute(fastify, option) {
  fastify.post(
    "/create-customer",
    { preHandler: [verifyApiKey, JWTAuth] },
    customerController.createCustomer
  );
  fastify.get(
    "/get-customer",
    { preHandler: [verifyApiKey, JWTAuth] },
    customerController.getAllCustomer
  );
  fastify.get(
    "/get-customer/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    customerController.getCustomerById
  );
  fastify.get(
    "/get-customer-sale-id/:staff_id",
    { preHandler: [verifyApiKey, JWTAuth] },
    customerController.getCustomerBySaleId
  );
  fastify.put(
    "/update-customer/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    customerController.updateCustomer
  );
  fastify.put(
    "/delete-customer/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    customerController.deleteCustomer
  );
}

module.exports = customerRoute;
