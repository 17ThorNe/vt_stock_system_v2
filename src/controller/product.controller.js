const { handleController } = require("../utils/dbHelper.js");
const productService = require("../service/product.service.js");

exports.getAllProducts = async (request, reply) => {
  try {
    const { page, limit } = request.query;
    const { role, user_id } = request.user;
    console.log("Hello permission role", role);
    const result = await productService.getAllProduct(
      user_id,
      parseInt(page) || 1,
      parseInt(limit) || 10,
      role
    );
    reply.code(200).send(result);
  } catch (error) {
    reply
      .code(error.statusCode || 500)
      .send({ error: error.message || "Database error" });
  }
};

exports.createProduct = async (request, reply) => {
  const data = request.body;
  const { user_id, role } = request.user;
  await handleController(request, reply, productService.createProduct, [
    user_id,
    data,
    role,
  ]);
};

exports.getProductById = async (request, reply) => {
  const { role, user_id } = request.user;
  const id = request.params.id;
  await handleController(request, reply, productService.getProductById, [
    id,
    user_id,
    role,
  ]);
};

exports.updateProduct = async (request, reply) => {
  const { role, user_id } = request.user;
  const id = request.params.id;
  const productDto = request.body;
  await handleController(request, reply, productService.updateProduct, [
    id,
    user_id,
    productDto,
    role,
  ]);
};

exports.deleteProduct = async (request, reply) => {
  const { user_id, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, productService.deleteProduct, [
    id,
    user_id,
    role,
  ]);
};

exports.getProductByCategoryId = async (request, reply) => {
  const { user_id, role } = request.user;
  const category_id = request.params.category_id;
  await handleController(
    request,
    reply,
    productService.getProductByCategoryId,
    [category_id, user_id, role]
  );
};

exports.getProductByExpireDate = async (request, reply) => {
  const { user_id, role } = request.user;
  const { days } = request.query;
  await handleController(
    request,
    reply,
    productService.getProductByExpireDate,
    [user_id, parseInt(days), role]
  );
};
