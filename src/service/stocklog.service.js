const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");
const permission = require("../utils/permission.js");
const printf = require("../utils/printf.utils.js");
const logJSON = require("../utils/logJSON.js");

exports.getAllStockLog = async (userId, role) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No have permiss", 403);
  }

  await userIdValidate(userId);

  const result = await db("stocklogs").select("*").where({ user_id: userId });

  if (result.length === 0) {
    throw validateError("Data is empty", 400);
  }

  return result;
};

exports.importStock = async (user_id, staff_id, role, dataArray) => {
  // === 1. Validate input ===
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    throw validateError("Invalid or empty stock log data", 400);
  }

  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission", 403);
  }

  await userIdValidate(user_id);

  // === 2. Validate staff ===
  const staffQuery = db("staff")
    .where({ user_id, permission_lvl: 2, status: "active" })
    .first();

  if (role === permission.inventory) {
    staffQuery.andWhere({ id: staff_id });
  }

  const staff = await staffQuery;
  if (!staff) throw validateError("Invalid Staff ID", 404);

  // === 3. Extract unique IDs ===
  const productIds = [
    ...new Set(dataArray.map((d) => d.product_id).filter(Boolean)),
  ];
  const supplierIds = [
    ...new Set(dataArray.map((d) => d.supplier_id).filter(Boolean)),
  ];

  if (productIds.length === 0 || supplierIds.length === 0) {
    throw validateError("Missing product_id or supplier_id", 400);
  }

  // === 4. Validate products in bulk ===
  const products = await db("products")
    .whereIn("id", productIds)
    .where({ user_id, is_deleted: false })
    .select("id", "quantity");

  const productMap = Object.fromEntries(
    products.map((p) => [p.id, p.quantity])
  );
  if (products.length !== productIds.length) {
    throw validateError("One or more Product IDs are invalid or deleted", 404);
  }

  // === 5. Validate suppliers in bulk ===
  const suppliers = await db("supplier")
    .whereIn("id", supplierIds)
    .where({ user_id, status: "active" })
    .select("id");

  if (suppliers.length !== supplierIds.length) {
    throw validateError(
      "One or more Supplier IDs are invalid or inactive",
      404
    );
  }

  // === 6. Prepare logs + calculate new quantities ===
  const logsToInsert = [];
  const productUpdates = {}; // { product_id: newQty }

  for (const data of dataArray) {
    const {
      product_id,
      order_id = null,
      supplier_id,
      stock_type = "in",
      quantity,
      note,
    } = data;

    // Required fields
    if (!product_id || !supplier_id || !quantity) {
      throw validateError(
        "Missing required fields: product_id, supplier_id, quantity",
        400
      );
    }

    const previousQty = productMap[product_id];
    let newQty;

    if (stock_type === "in") {
      newQty = previousQty + quantity;
    } else if (stock_type === "out") {
      newQty = previousQty - quantity;
      if (newQty < 0) {
        throw validateError(
          `Insufficient stock for product ID ${product_id}`,
          400
        );
      }
    } else {
      throw validateError("Invalid stock_type. Must be 'in' or 'out'", 400);
    }

    logsToInsert.push({
      user_id,
      staff_id,
      order_id,
      product_id,
      supplier_id,
      stock_type,
      quantity,
      p_stock: previousQty,
      n_stock: newQty,
      note: note || null,
      created_at: new Date(),
    });

    productUpdates[product_id] = newQty;
  }

  // === 7. TRANSACTION: Update products + Insert logs (ONCE) ===
  return await db.transaction(async (trx) => {
    // Update product quantities
    for (const [pid, qty] of Object.entries(productUpdates)) {
      await trx("products")
        .update({ quantity: qty })
        .where({ user_id, id: pid, is_deleted: false });
    }

    // === INSERT ONLY ONCE ===
    await trx("stocklogs").insert(logsToInsert);

    // === Get inserted IDs safely (MySQL) ===
    const [before] = await trx.raw("SELECT LAST_INSERT_ID() as id");
    const firstId = before.id + 1;
    const insertedIds = Array.from(
      { length: logsToInsert.length },
      (_, i) => firstId + i
    );

    return {
      success: true,
      count: logsToInsert.length,
      inserted_ids: insertedIds,
    };
  });
};
