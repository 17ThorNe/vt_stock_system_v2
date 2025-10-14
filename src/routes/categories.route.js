const categoryController = require("../controller/categories.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");

async function categoryRoutes(fastify, option) {
  fastify.post(
    "/create-category",
    { preHandler: [verifyApiKey, JWTAuth] },
    categoryController.createCategory
  );
  fastify.get(
    "/get-category",
    { preHandler: [verifyApiKey, JWTAuth] },
    categoryController.getAllCategory
  );
  fastify.get(
    "/get-category/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    categoryController.getCategoryById
  );
  fastify.put(
    "/update-category/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    categoryController.updateCategory
  );
  fastify.put(
    "/delete-category/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    categoryController.deleteCategory
  );
}
module.exports = categoryRoutes;
