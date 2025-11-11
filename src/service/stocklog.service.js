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
  // 1️⃣ Validate input
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    throw validateError("Invalid or empty stock log data", 400);
  }

  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission", 403);
  }

  await userIdValidate(user_id);

  // 2️⃣ Validate staff
  const staffQuery = db("staff")
    .where({ user_id, permission_lvl: 2, status: "active" })
    .first();

  if (role === permission.inventory) {
    staffQuery.andWhere({ id: staff_id });
  }

  const staff = await staffQuery;
  if (!staff) throw validateError("Invalid Staff ID", 404);

  // 3️⃣ Extract unique product & supplier IDs
  const productIds = [
    ...new Set(dataArray.map((d) => d.product_id).filter(Boolean)),
  ];
  const supplierIds = [
    ...new Set(dataArray.map((d) => d.supplier_id).filter(Boolean)),
  ];

  if (productIds.length === 0 || supplierIds.length === 0) {
    throw validateError("Missing product_id or supplier_id", 400);
  }

  // 4️⃣ Validate products
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

  // 5️⃣ Validate suppliers
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

  // 6️⃣ Prepare logs + calculate new quantities
  const productUpdates = {};
  const logsToInsert = [];

  for (const data of dataArray) {
    const {
      product_id,
      order_id = null,
      supplier_id,
      stock_type = "in",
      quantity,
      cost_price,
      sale_price,
      note,
    } = data;

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
      if (newQty < 0)
        throw validateError(
          `Insufficient stock for product ID ${product_id}`,
          400
        );
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
      cost_price: cost_price || 0,
      sale_price: sale_price || 0,
      p_stock: previousQty,
      n_stock: newQty,
      note: note || null,
      created_at: new Date(),
    });

    productUpdates[product_id] = newQty;
  }

  // 7️⃣ TRANSACTION: update products + insert logs
  return await db.transaction(async (trx) => {
    const insertedIds = [];

    // Update product quantities
    for (const pid in productUpdates) {
      await trx("products")
        .update({ quantity: productUpdates[pid] })
        .where({ user_id, id: pid, is_deleted: false });
    }

    // Insert logs one by one
    for (const log of logsToInsert) {
      const [id] = await trx("stocklogs").insert(log);
      insertedIds.push(id);
    }

    return {
      success: true,
      count: logsToInsert.length,
      inserted_ids: insertedIds,
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
