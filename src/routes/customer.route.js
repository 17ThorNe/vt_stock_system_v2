const customerController = require("../controller/customer.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
async function customerRoute(fastify, option) {
  fastify.post(
    "/create-customer",
    { preHandler: [JWTAuth] },
    customerController.createCustomer
  );
  fastify.get(
    "/get-customer",
    { preHandler: [JWTAuth] },
    customerController.getAllCustomer
  );
  fastify.get(
    "/get-customer/:id",
    { preHandler: [JWTAuth] },
    customerController.getCustomerById
  );
  fastify.get(
    "/get-customer-sale-id/:sale_id",
    { preHandler: [JWTAuth] },
    customerController.getCustomerBySaleId
  );
}

module.exports = customerRoute;
