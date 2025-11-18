const db = require("../config/knex.js");
const permission = require("../utils/permission.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");

exports.getAllProduct = async (
  user_id,
  page = 1,
  limit = 10,
  permissinRole
) => {
  if (
    ![permission.admin, permission.inventory, permission.sale_person].includes(
      permissinRole
    )
  ) {
    throw validateError("No permission", 403);
  }

  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const total = await db("products")
    .where({ user_id, is_deleted: false })
    .count("id as count")
    .first();

  if (!total || total.count === 0) {
    const error = new Error("No products found");
    error.statusCode = 200;
    throw error;
  }

  const offset = (page - 1) * limit;

  const products = await db("products")
    .where({ user_id, is_deleted: false })
    .andWhere("quantity", ">", 0)
    .select("*")
    .limit(limit)
    .offset(offset)
    .orderBy("created_at", "desc");

  return {
    status: "success",
    data: products,
    pagination: {
      total: total.count,
      page,
      limit,
      lastPage: Math.ceil(total.count / limit),
    },
  };
};

exports.createProduct = async (user_id, data, permissinRole) => {
  if (![permission.admin, permission.inventory].includes(permissinRole)) {
    throw validateError("No have permission", 403);
  }

  const user = await db("users").where({ id: user_id }).first();
  if (!user) throw validateError("User not found", 404);

  if (!Array.isArray(data)) throw validateError("Data must be an array", 400);

  const productsToInsert = [];

  for (const product of data) {
    // ---------- Normalise price / cost ----------
    const price =
      product.price ?? product.selling_price ?? product.default_price ?? 0;
    const cost = product.cost ?? product.unit_cost ?? product.default_cost ?? 0;

    if (!price || isNaN(price))
      throw validateError("Price is required and must be a number", 400);
    if (!cost || isNaN(cost))
      throw validateError("Cost is required and must be a number", 400);

    // ---------- Required fields ----------
    if (
      !product.name ||
      typeof product.name !== "string" ||
      product.name.trim() === ""
    ) {
      throw validateError("Product name is required and non-empty", 400);
    }
    if (
      !product.sku ||
      typeof product.sku !== "string" ||
      product.sku.trim() === ""
    ) {
      throw validateError("SKU is required and non-empty", 400);
    }
    if (!Number.isInteger(product.category_id)) {
      throw validateError("category_id must be an integer", 400);
    }

    // ---------- Category exists ----------
    const category = await db("categories")
      .where({ id: product.category_id, user_id, is_deleted: false })
      .first();
    if (!category)
      throw validateError(`Category ID ${product.category_id} not found`, 404);

    // ---------- Duplicate name / SKU ----------
    const existingName = await db("products")
      .whereRaw("LOWER(name) = ? AND user_id = ? AND is_deleted = ?", [
        product.name.toLowerCase(),
        user_id,
        false,
      ])
      .first();
    if (existingName)
      throw validateError(`Product name '${product.name}' already exists`, 400);

    const existingSku = await db("products")
      .where({ sku: product.sku, is_deleted: false })
      .first();
    if (existingSku)
      throw validateError(`SKU '${product.sku}' already exists`, 400);

    // ---------- Build insert ----------
    productsToInsert.push({
      name: product.name.trim(),
      description: product.description ?? null,
      sku: product.sku.trim(),
      category_id: product.category_id,
      default_price: parseFloat(price),
      default_cost: parseFloat(cost),
      quantity: 0, // always start at zero
      total_in: 0,
      total_out: 0,
      product_img: product.product_img ?? null,
      user_id,
      status: product.status ?? "active",
      is_deleted: false,
    });
  }

  const insertedIds = await db("products")
    .insert(productsToInsert)
    .returning("id");
  return insertedIds;
};

exports.getProductById = async (id, user_id, permissinRole) => {
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

  const product = await db("products")
    .where({ id, user_id, is_deleted: false })
    .first();

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

exports.updateProduct = async (id, user_id, productData, permissinRole) => {
  if (![permission.admin, permission.inventory].includes(permissinRole)) {
    throw validateError("No have permission", 403);
  }
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const product = await db("products")
    .where({ id, user_id, is_deleted: false })
    .first();
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  await db("products").where({ id, user_id }).update(productData);
};

exports.deleteProduct = async (id, user_id, permissinRole) => {
  if (![permission.admin, permission.inventory].includes(permissinRole)) {
    throw validateError("No have permission", 403);
  }
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const product = await db("products")
    .where({ id, user_id, is_deleted: false })
    .first();
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  await db("products").where({ id, user_id }).update({ is_deleted: true });
};

exports.getProductByCategoryId = async (
  category_id,
  user_id,
  permissinRole
) => {
  if (
    ![permission.admin, permission.inventory, permission.sale_person].includes(
      permissinRole
    )
  ) {
    throw validateError("No have permission!", 403);
  }
  await userIdValidate(user_id);

  const category = await db("categories")
    .where({ id: category_id, user_id, is_deleted: false })
    .first();
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 200;
    throw error;
  }

  const products = await db("products")
    .where({ category_id, user_id, is_deleted: false })
    .select("*");

  if (products.length === 0) {
    const error = new Error("No products found for this category");
    error.statusCode = 200;
    throw error;
  }

  return products;
};

exports.getProductByExpireDate = async (user_id, days = 7, permissinRole) => {
  if (![permission.admin, permission.inventory].includes(permissinRole)) {
    throw validateError("No have permission", 403);
  }
  await userIdValidate(user_id);
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + days);

  const products = await db("products")
    .where({ user_id, is_deleted: false })
    .andWhere("expire_date", "<=", targetDate)
    .select("*");
  if (products.length === 0) {
    const error = new Error("No expired products found");
    error.statusCode = 404;
    throw error;
  }
  return products;
};
