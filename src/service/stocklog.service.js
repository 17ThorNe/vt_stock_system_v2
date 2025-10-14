const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");
const permission = require("../utils/permission.js");
const printf = require("../utils/printf.utils.js");
const logJSON = require("../utils/logJSON.js");

exports.getAllStockLog = async (userId, staffId, role) => {
  printf("Here Get All StockLogs");
};

exports.importStock = async (user_id, staff_id, role, data) => {
  const { product_id, order_id, stock_type = "in", quantity, note } = data;

  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  let isStaffId = db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 2, status: "active" })
    .first();

  if (role === permission.inventory) {
    isStaffId.andWhere({ id: staff_id });
  }

  const resultIsStaffId = await isStaffId;

  if (!resultIsStaffId) {
    throw validateError("Staff ID", 404);
  }

  const isProductId = await db("products")
    .select("*")
    .where({ user_id, id: product_id, is_deleted: false })
    .first();

  if (!isProductId) {
    throw validateError("Product ID", 404);
  }

  const isOrderId = await db("orders")
    .select("*")
    .where({ user_id, id: order_id, is_deleted: false })
    .first();

  if (!isOrderId) {
    throw validateError("Order ID", 404);
  }

  const getQtyProduct = await db("products")
    .select("quantity")
    .where({ user_id, id: product_id, is_deleted: false })
    .first();

  const previousQty = getQtyProduct.quantity;

  let updateTotalQuantity;

  if (stock_type === "in") {
    updateTotalQuantity = previousQty + quantity;
  } else if (stock_type === "out") {
    updateTotalQuantity = previousQty - quantity;
  }

  const finalInsertData = {
    user_id,
    staff_id,
    order_id,
    product_id,
    stock_type,
    quantity,
    p_stock: previousQty,
    n_stock: updateTotalQuantity,
    note,
    created_at: new Date(),
  };

  await db("products")
    .update({ quantity: updateTotalQuantity })
    .where({ user_id, id: product_id, is_deleted: false });

  await db("stocklogs").insert(finalInsertData);

  return updateTotalQuantity;
};
