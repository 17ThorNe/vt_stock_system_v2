const db = require("../config/knex.js");

exports.getAllProduct = async (user_id, page = 1, limit = 10) => {
  // check user exist
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  // count total products (for pagination info)
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

exports.createProduct = async (user_id, data) => {
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
