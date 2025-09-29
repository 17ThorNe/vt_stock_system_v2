const productController = require("../controller/product.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
async function productRoute(fastify, option) {
  fastify.get(
    "/get-products",
    { preHandler: [JWTAuth] },
    productController.getAllProducts
  );
}

module.exports = productRoute;
