const db = require("../config/knex.js");
const validateError = require("../utils/validateError.js");
require("dotenv").config();

const permission = {
  admin: "admin",
  inventory: "inventory_manager",
  sale_person: "sale_person",
};

exports.createCategory = async (user_id, categoryDto, permissinRole) => {
  if (![permission.admin, permission.inventory].includes(permissinRole)) {
    throw validateError("No permission", 403);
  }

  const checkUserId = await db("users").where({ id: user_id }).first();
  if (!checkUserId) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const categories = Array.isArray(categoryDto) ? categoryDto : [categoryDto];

  if (categories.length === 0) {
    const error = new Error("No category data provided");
    error.statusCode = 400;
    throw error;
  }

  const categoryNames = categories.map((cat) => {
    if (!cat.name || typeof cat.name !== "string") {
      const error = new Error("Each category must have a valid 'name' field");
      error.statusCode = 400;
      throw error;
    }
    return cat.name.trim().toLowerCase();
  });

  const uniqueNames = new Set(categoryNames);
  if (uniqueNames.size !== categoryNames.length) {
    const error = new Error("Duplicate category names in request");
    error.statusCode = 400;
    throw error;
  }

  const existingCategories = await db("categories")
    .whereIn("name", categoryNames)
    .andWhere({ user_id, is_deleted: false })
    .select("name");

  if (existingCategories.length > 0) {
    const existingNames = existingCategories.map((c) => c.name).join(", ");
    const error = new Error(`Category names already exist: ${existingNames}`);
    error.statusCode = 400;
    throw error;
  }

  const categoriesToInsert = categories.map((cat) => ({
    name: cat.name.trim().toLowerCase(),
    description: cat.description?.trim() || null,
    status: "active",
    is_deleted: false,
    user_id: user_id,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  }));

  const inserted = await db("categories")
    .insert(categoriesToInsert)
    .returning(["id", "name", "description", "status"]);

  return {
    message: `Successfully created ${inserted.length} categor${
      inserted.length > 1 ? "ies" : "y"
    }`,
    count: inserted.length,
    data: inserted,
  };
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
    .orderBy("created_at", "desc")
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
