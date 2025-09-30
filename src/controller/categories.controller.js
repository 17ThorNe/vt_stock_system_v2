const { handleController } = require("../utils/dbHelper.js");
const categoryService = require("../service/categories.service.js");

exports.createCategory = async (request, reply) => {
  const user_id = request.user.id;
  console.log("User ID in controller category:", user_id);
  const categoryDto = request.body;
  await handleController(request, reply, categoryService.createCategory, [
    user_id,
    categoryDto,
  ]);
};

exports.getAllCategory = async (request, reply) => {
  const user_id = request.user.id;
  await handleController(request, reply, categoryService.getAllCategory, [
    user_id,
  ]);
};

exports.getCategoryById = async (request, reply) => {
  const user_id = request.user.id;
  const id = request.params.id;
  await handleController(request, reply, categoryService.getCategoryById, [
    id,
    user_id,
  ]);
};

exports.updateCategory = async (request, reply) => {
  const user_id = request.user.id;
  const id = request.params.id;
  const categoryDto = request.body;
  await handleController(request, reply, categoryService.updateCategory, [
    id,
    user_id,
    categoryDto,
  ]);
};

exports.deleteCategory = async (request, reply) => {
  const user_id = request.user.id;
  const id = request.params.id;
  await handleController(request, reply, categoryService.deleteCategory, [
    id,
    user_id,
  ]);
};
