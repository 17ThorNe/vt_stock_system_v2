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
    error.statusCode = 404;
    throw error;
  }

  const offset = (page - 1) * limit;

  const products = await db("products")
    .where({ user_id, is_deleted: false })
    .select("*")
    .limit(limit)
    .offset(offset);

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
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  if (!Array.isArray(data)) {
    const error = new Error("Input data must be an array of products!");
    error.statusCode = 400;
    throw error;
  }

  const productsToInsert = [];

  for (const product of data) {
    if (
      !product.name ||
      typeof product.name !== "string" ||
      product.name.trim() === ""
    ) {
      const error = new Error(
        "Product name is required and must be a non-empty string"
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      !product.sku ||
      typeof product.sku !== "string" ||
      product.sku.trim() === ""
    ) {
      const error = new Error(
        "Product SKU is required and must be a non-empty string"
      );
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(product.category_id)) {
      const error = new Error("Category ID is required and must be an integer");
      error.statusCode = 400;
      throw error;
    }

    const category = await db("categories")
      .where({ id: product.category_id, user_id, is_deleted: false })
      .first();
    if (!category) {
      const error = new Error(
        `Category ID ${product.category_id} not found for this user`
      );
      error.statusCode = 404;
      throw error;
    }

    const existingProduct = await db("products")
      .whereRaw("LOWER(name) = ? AND user_id = ? AND is_deleted = ?", [
        product.name.toLowerCase(),
        user_id,
        false,
      ])
      .first();
    if (existingProduct) {
      const error = new Error(`Product name '${product.name}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    const existingSku = await db("products")
      .where({ sku: product.sku, is_deleted: false })
      .first();
    if (existingSku) {
      const error = new Error(`SKU '${product.sku}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    productsToInsert.push({
      name: product.name,
      description: product.description || null,
      sku: product.sku,
      category_id: product.category_id,
      price: product.price !== undefined ? parseFloat(product.price) : 0.0,
      cost: product.cost !== undefined ? parseFloat(product.cost) : 0.0,
      quantity:
        product.quantity !== undefined ? parseInt(product.quantity, 10) : 0,
      total_in:
        product.total_in !== undefined ? parseInt(product.total_in, 10) : 0,
      total_out:
        product.total_out !== undefined ? parseInt(product.total_out, 10) : 0,
      product_img: product.product_img || null,
      user_id,
      status: product.status || "active",
      is_deleted: false,
    });
  }

  await db("products").insert(productsToInsert);
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
    error.statusCode = 404;
    throw error;
  }

  const products = await db("products")
    .where({ category_id, user_id, is_deleted: false })
    .select("*");

  if (products.length === 0) {
    const error = new Error("No products found for this category");
    error.statusCode = 404;
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
