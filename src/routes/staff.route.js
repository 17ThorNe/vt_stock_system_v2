const staffController = require("../controller/staff.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");

async function staffRoutes(fastify, option) {
  fastify.post(
    "/create-staff",
    { preHandler: [verifyApiKey, JWTAuth] },
    staffController.createStaff
  );
  fastify.get(
    "/get-all-staff",
    { preHandler: [verifyApiKey, JWTAuth] },
    staffController.getAllStaff
  );
  fastify.get(
    "/get-staff/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    staffController.getStaffById
  );
  fastify.put(
    "/update-staff/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    staffController.updateStaff
  );
  fastify.put(
    "/delete-staff/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    staffController.deleteStaff
  );
}

module.exports = staffRoutes;
