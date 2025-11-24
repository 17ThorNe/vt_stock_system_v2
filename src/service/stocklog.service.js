const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");
const permission = require("../utils/permission.js");
const printf = require("../utils/printf.utils.js");
const logJSON = require("../utils/logJSON.js");

exports.getAllStockLog = async (userId, role) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(userId);

  const result = await db("stocklogs as sl")
    .join("products as p", "sl.product_id", "p.id")
    .select(
      "sl.id",
      "sl.user_id",
      "sl.staff_id",
      "sl.product_id",
      "sl.supplier_id",
      "sl.order_id",
      "sl.stock_type",
      "sl.quantity",
      "sl.cost_price",
      "sl.sale_price",
      "sl.p_stock",
      "sl.n_stock",
      "sl.note",
      "sl.created_at",

      // From products table
      "p.name as product_name",
      "p.product_img as product_image",
      "p.sku as product_sku"
    )
    .where("sl.user_id", userId)
    .orderBy("sl.created_at", "desc");

  if (result.length === 0) {
    throw validateError("Data is empty", 400);
  }

  return result;
};

exports.importStock = async (user_id, staff_id, role, dataArray) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    throw validateError("Invalid or empty stock log data", 400);
  }

  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission", 403);
  }

  await userIdValidate(user_id);

  let staffQuery = db("staff")
    .where({ user_id, permission_lvl: 2, status: "active" })
    .first();

  if (role === permission.inventory) {
    staffQuery.andWhere({ id: staff_id });
  }

  const staff = await staffQuery;
  if (!staff) {
    throw validateError("Invalid Staff ID", 404);
  }

  const productIds = [...new Set(dataArray.map((x) => x.product_id))];
  const supplierIds = [...new Set(dataArray.map((x) => x.supplier_id))];

  if (!productIds.length || !supplierIds.length) {
    throw validateError("Missing product_id or supplier_id", 400);
  }

  const products = await db("products")
    .whereIn("id", productIds)
    .where({ user_id, is_deleted: false })
    .select("id", "quantity");

  if (products.length !== productIds.length) {
    throw validateError("One or more Product IDs invalid", 404);
  }

  const productMap = Object.fromEntries(
    products.map((p) => [p.id, p.quantity])
  );

  const suppliers = await db("supplier")
    .whereIn("id", supplierIds)
    .where({ user_id, status: "active" })
    .select("id");

  if (suppliers.length !== supplierIds.length) {
    throw validateError("Supplier ID invalid or inactive", 404);
  }

  const logsToInsert = [];
  const productUpdates = {};

  for (const data of dataArray) {
    const {
      product_id,
      supplier_id,
      stock_type,
      quantity,
      cost_price,
      sale_price,
      note,
      order_id = null,
    } = data;

    const previousQty = productMap[product_id];
    let newQty = previousQty;

    if (stock_type === "in") newQty += quantity;
    else if (stock_type === "out") {
      newQty -= quantity;
      if (newQty < 0) throw validateError("Insufficient stock", 400);
    } else throw validateError("Invalid stock_type", 400);

    logsToInsert.push({
      user_id,
      staff_id,
      product_id,
      supplier_id,
      order_id,
      stock_type,
      quantity,
      cost_price: cost_price ?? 0,
      sale_price: sale_price ?? 0,
      p_stock: previousQty,
      n_stock: newQty,
      note: note ?? null,
      created_at: new Date(),
    });

    productMap[product_id] = newQty;

    productUpdates[product_id] = {
      quantity: newQty,
      total_in:
        stock_type === "in" ? db.raw(`total_in + ${quantity}`) : undefined,
      total_out:
        stock_type === "out" ? db.raw(`total_out + ${quantity}`) : undefined,
    };
  }

  return await db.transaction(async (trx) => {
    for (const [pid, upd] of Object.entries(productUpdates)) {
      await trx("products")
        .update(upd)
        .where({ user_id, id: pid, is_deleted: false });
    }

    const inserted = await trx("stocklogs").insert(logsToInsert);

    return {
      success: true,
      count: logsToInsert.length,
      inserted_ids: inserted,
    };
  });
};

exports.getStockLogStats = async (user_id, role) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission", 403);
  }

  await userIdValidate(user_id);

  const result = await db("stocklogs")
    .where("user_id", user_id)
    .select(
      db.raw(
        `IFNULL(SUM(CASE WHEN stock_type = 'out' THEN quantity * sale_price END), 0) AS revenue`
      ),
      db.raw(
        `IFNULL(SUM(CASE WHEN stock_type = 'in' THEN quantity * cost_price END), 0) AS cost`
      ),
      db.raw(
        `IFNULL(SUM(CASE WHEN stock_type = 'out' THEN quantity * (sale_price - cost_price) END), 0) AS profit`
      )
    )
    .first();

  return {
    revenue: Number(result.revenue),
    cost: Number(result.cost),
    profit: Number(result.profit),
    loss: result.profit < 0 ? Math.abs(result.profit) : 0,
  };
};

exports.addStock = async (user_id, staff_id, role, addData) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission", 403);
  }
  await userIdValidate(user_id);

  let staffQuery = db("staff")
    .where({ user_id, permission_lvl: 2, status: "active" })
    .first();
  if (role === permission.inventory) {
    staffQuery = staffQuery.andWhere({ id: staff_id });
  }
  const staff = await staffQuery;
  if (!staff) throw validateError("Invalid Staff ID", 404);

  const {
    product_id,
    supplier_id,
    quantity,
    cost_price = 0,
    note = null,
  } = addData;

  if (!product_id || !quantity || quantity <= 0) {
    throw validateError("product_id and positive quantity are required", 400);
  }
  const product = await db("products")
    .where({ id: product_id, user_id, is_deleted: false })
    .select("id", "quantity", "total_in")
    .first();

  if (!product) throw validateError("Product not found or deleted", 404);
  if (supplier_id) {
    const supplier = await db("supplier")
      .where({ id: supplier_id, user_id, status: "active" })
      .first();
    if (!supplier) throw validateError("Invalid supplier", 404);
  }

  const previousQty = product.quantity;
  const newQty = previousQty + quantity;
  return await db.transaction(async (trx) => {
    await trx("products")
      .update({
        quantity: newQty,
        total_in: trx.raw(`total_in + ${quantity}`),
      })
      .where({ id: product_id, user_id });
    const [logId] = await trx("stocklogs").insert({
      user_id,
      staff_id,
      product_id,
      supplier_id: supplier_id || null,
      order_id: null,
      stock_type: "in",
      quantity,
      cost_price,
      sale_price: 0,
      p_stock: previousQty,
      n_stock: newQty,
      note,
      created_at: new Date(),
    });
    const fullLog = await trx("stocklogs as sl")
      .join("products as p", "sl.product_id", "p.id")
      .select(
        "sl.*",
        "p.name as product_name",
        "p.product_img as product_image",
        "p.sku as product_sku"
      )
      .where("sl.id", logId)
      .first();

    return {
      log: fullLog,
      updated_quantity: newQty,
    };
  });
};

exports.getStockLogById = async (user_id, role, log_id) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission", 403);
  }

  await userIdValidate(user_id);

  const res = await db("stocklogs")
    .where({
      user_id,
      id: log_id,
    })
    .first();

  console.log("res", res);

  if (!res) {
    throw validateError("Stock log not found", 404);
  }

  return res;
};

exports.getStockLogByProductId = async (user_id, role, product_id) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission", 403);
  }

  await userIdValidate(user_id);

  const checkProduct = await db("products")
    .select("*")
    .where({ user_id, id: product_id, is_deleted: false })
    .first();

  if (!checkProduct) {
    throw validateError("Product not found!", 404);
  }

  const res = await db("stocklogs")
    .select("*")
    .where({ user_id, id: product_id })
    .first();

  if (!res) {
    throw validateError("Stocklog not found!", 404);
  }

  return res;
};
