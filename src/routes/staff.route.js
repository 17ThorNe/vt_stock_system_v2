const staffController = require("../controller/staff.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function staffRoutes(fastify, option) {
  fastify.post(
    "/create-staff",
    { preHandler: [JWTAuth] },
    staffController.createStaff
  );
  fastify.get(
    "/get-all-staff",
    { preHandler: [JWTAuth] },
    staffController.getAllStaff
  );
  fastify.get(
    "/get-staff/:id",
    { preHandler: [JWTAuth] },
    staffController.getStaffById
  );
  fastify.put(
    "/update-staff/:id",
    { preHandler: [JWTAuth] },
    staffController.updateStaff
  );
  fastify.put(
    "/delete-staff/:id",
    { preHandler: [JWTAuth] },
    staffController.deleteStaff
  );
}

module.exports = staffRoutes;
