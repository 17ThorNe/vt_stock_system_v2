const productController = require("../controller/product.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");
async function productRoute(fastify, option) {
  fastify.get(
    "/get-products",
    { preHandler: [verifyApiKey, JWTAuth] },
    productController.getAllProducts
  );
  fastify.post(
    "/create-products",
    { preHandler: [verifyApiKey, JWTAuth] },
    productController.createProduct
  );
  fastify.get(
    "/get-products/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    productController.getProductById
  );
  fastify.put(
    "/update-products/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    productController.updateProduct
  );
  fastify.put(
    "/delete-products/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    productController.deleteProduct
  );
  fastify.get(
    "/get-products-cat-id/:category_id",
    { preHandler: [verifyApiKey, JWTAuth] },
    productController.getProductByCategoryId
  );
  fastify.get(
    "/get-products-expire",
    { preHandler: [verifyApiKey, JWTAuth] },
    productController.getProductByExpireDate
  );
}

module.exports = productRoute;
