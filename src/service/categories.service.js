const db = require("../config/knex.js");
const validateError = require("../utils/validateError.js");
require("dotenv").config();

const permission = {
  admin: "admin",
  inventory: "inventory_mananger",
  sale_person: "sale_person",
};

exports.createCategory = async (user_id, categoryDto, permissinRole) => {
  if (![permission.admin, permission.inventory].includes(permissinRole)) {
    throw validateError("No have permission", 403);
  }

  const checkUserId = await db("users").where({ id: user_id }).first();
  if (!checkUserId) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
  for (const cat of categoryDto) {
    const existingCategory = await db("categories")
      .where({
        name: cat.name.toLowerCase(),
        user_id: user_id,
        is_deleted: false,
      })
      .first();
    if (existingCategory) {
      const error = new Error(`Category name ${cat.name} already exists`);
      error.statusCode = 400;
      throw error;
    }
  }
  const categoriesToInsert = categoryDto.map((cat) => ({
    name: cat.name.toLowerCase(),
    description: cat.description || null,
    status: "active",
    is_deleted: false,
    user_id: user_id,
  }));

  await db("categories").insert(categoriesToInsert);
};

exports.getAllCategory = async (user_id, permissinRole) => {
  if (
    ![permission.admin, permission.inventory, permission.sale_person].includes(
      permissinRole
    )
  ) {
    throw validateError("No have permission", 403);
  }
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
  const result = await db("categories")
    .where({ user_id, is_deleted: false })
    .select("*");

  if (result.length === 0) {
    const error = new Error("No categories found");
    error.statusCode = 200;
    throw error;
  }

  return result;
};

exports.getCategoryById = async (id, user_id, permissinRole) => {
  if (
    ![permission.admin, permission.inventory, permission.sale_person].includes(
      permissinRole
    )
  ) {
    throw validateError("No have permission", 403);
  }
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const category = await db("categories")
    .where({ id, user_id, is_deleted: false })
    .first();
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  return category;
};

exports.updateCategory = async (id, user_id, data, permissinRole) => {
  if (![permission.admin, permission.inventory].includes(permissinRole)) {
    throw validateError("No have permission", 403);
  }
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
  const category = await db("categories")
    .where({ id, user_id, is_deleted: false })
    .first();
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  if (data.name.toLowerCase()) {
    if (data.name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await db("categories")
        .where({
          name: data.name.toLowerCase(),
          user_id: user_id,
          is_deleted: false,
        })
        .first();
      if (existingCategory) {
        const error = new Error(`Category name ${data.name} already exists`);
        error.statusCode = 400;
        throw error;
      }
    }
  }
  await db("categories").where({ id, user_id }).update(data);
};

exports.deleteCategory = async (id, user_id, permissinRole) => {
  if (![permission.admin, permission.inventory].includes(permissinRole)) {
    throw validateError("No have permission", 403);
  }
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
  const category = await db("categories")
    .where({ id, user_id, is_deleted: false })
    .first();
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  await db("categories")
    .where({ id, user_id })
    .update({ is_deleted: true, status: "inactive" });
};
