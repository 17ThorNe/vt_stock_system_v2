const { handleController } = require("../utils/dbHelper.js");
const productService = require("../service/product.service.js");

exports.getAllProducts = async (request, reply) => {
  const user_id = request.user.id;
  await handleController(request, reply, productService.getAllProduct, [
    user_id,
  ]);
};
