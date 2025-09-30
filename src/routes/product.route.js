const productController = require("../controller/product.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
async function productRoute(fastify, option) {
  fastify.get(
    "/get-products",
    { preHandler: [JWTAuth] },
    productController.getAllProducts
  );
  fastify.post(
    "/create-products",
    { preHandler: [JWTAuth] },
    productController.createProduct
  );
  fastify.get(
    "/get-products/:id",
    { preHandler: [JWTAuth] },
    productController.getProductById
  );
  fastify.put(
    "/update-products/:id",
    { preHandler: [JWTAuth] },
    productController.updateProduct
  );
  fastify.put(
    "/delete-products/:id",
    { preHandler: [JWTAuth] },
    productController.deleteProduct
  );
  fastify.get(
    "/get-products-cat-id/:category_id",
    { preHandler: [JWTAuth] },
    productController.getProductByCategoryId
  );
  fastify.get(
    "/get-products-expire",
    { preHandler: [JWTAuth] },
    productController.getProductByExpireDate
  );
}

module.exports = productRoute;
