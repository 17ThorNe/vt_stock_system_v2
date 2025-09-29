const categoryController = require("../controller/categories.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function categoryRoutes(fastify, option) {
  fastify.post(
    "/create-category",
   
    categoryController.createCategory
  );
  fastify.get(
    "/get-category",
    { preHandler: [JWTAuth] },
    categoryController.getAllCategory
  );
  fastify.get(
    "/get-category/:id",
    { preHandler: [JWTAuth] },
    categoryController.getCategoryById
  );
  fastify.put(
    "/update-category/:id",
    { preHandler: [JWTAuth] },
    categoryController.updateCategory
  );
  fastify.put(
    "/delete-category/:id",
    { preHandler: [JWTAuth] },
    categoryController.deleteCategory
  );
}
module.exports = categoryRoutes;
