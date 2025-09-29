const { handleController } = require("../utils/dbHelper.js");
const productService = require("../service/product.service.js");

exports.getAllProducts = async (request, reply) => {
  try {
    const user_id = request.user.id;
    const { page, limit } = request.query;
    const result = await productService.getAllProduct(
      user_id,
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
    reply.code(200).send(result);
  } catch (error) {
    reply
      .code(error.statusCode || 500)
      .send({ error: error.message || "Database error" });
  }
};

exports.createProduct = async (request, reply) => {
  const user_id = request.user.id;
  const data = request.body;
  await handleController(request, reply, productService.createProduct, [
    user_id,
    data,
  ]);
};
