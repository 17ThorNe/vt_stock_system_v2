const { handleController } = require("../utils/dbHelper.js");
const categoryService = require("../service/categories.service.js");

exports.createCategory = async (request, reply) => {
  const { user_id, role } = request.user;
  const categoryDto = request.body;
  await handleController(request, reply, categoryService.createCategory, [
    user_id,
    categoryDto,
    role,
  ]);
};

exports.getAllCategory = async (request, reply) => {
  const { user_id, role } = request.user;
  await handleController(request, reply, categoryService.getAllCategory, [
    user_id,
    role,
  ]);
};

exports.getCategoryById = async (request, reply) => {
  const { user_id, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, categoryService.getCategoryById, [
    id,
    user_id,
    role,
  ]);
};

exports.updateCategory = async (request, reply) => {
  const { user_id, role } = request.user;
  const id = request.params.id;
  const categoryDto = request.body;
  await handleController(request, reply, categoryService.updateCategory, [
    id,
    user_id,
    categoryDto,
    role,
  ]);
};

exports.deleteCategory = async (request, reply) => {
  const { user_id, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, categoryService.deleteCategory, [
    id,
    user_id,
    role,
  ]);
};
