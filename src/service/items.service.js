const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");
const permission = require("../utils/permission.js");
const printf = require("../utils/printf.utils.js");
const logJSON = require("../utils/logJSON.js");

exports.createItems = async (user_id, staff_id, order_id, role, data) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  let isStaff = db("staff")
    .select("*")
    .where({ status: "active", user_id, permission_lvl: 3 });

  if (role === permission.sale_person) {
    isStaff.andWhere({ id: staff_id });
  }

  const result = await isStaff;
  if (result.length === 0) {
    throw validateError("Staff ID", 404);
  }

  let orderQuery = db("orders")
    .select("*")
    .where({ user_id, id: order_id, is_deleted: false });

  if (role === permission.sale_person) {
    orderQuery.andWhere({ sale_person: staff_id });
  }

  const checkOrderQuery = await orderQuery;
  if (checkOrderQuery.length === 0) {
    throw validateError("Order ID not found", 404);
  }

  if (!Array.isArray(data)) {
    throw validateError("Data must be an array of items", 400);
  }

  const finalDataToInsert = data.map((item) => ({
    order_id,
    user_id,
    sale_id: staff_id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));
  await db("order_items").insert(finalDataToInsert);
};

exports.getAllItems = async (user_id, staff_id, role) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  const isStaffQuery = db("staff")
    .select("*")
    .where({ user_id, status: "active", permission_lvl: 3 })
    .first();

  if (role === permission.sale_person) {
    isStaffQuery.andWhere({ id: staff_id });
  }

  const resultIsStaffQuery = await isStaffQuery;
  if (!resultIsStaffQuery) {
    throw validateError("Staff ID", 404);
  }

  let itemsQuery = db("order_items")
    .select("*")
    .where({ user_id, is_deleted: false });

  if (role === permission.sale_person) {
    itemsQuery.andWhere({ sale_id: staff_id });
  }

  const resultQuery = await itemsQuery;

  if (resultQuery.length === 0) {
    throw validateError("Order Items", 404);
  }

  return resultQuery;
};

exports.getItemById = async (user_id, staff_id, item_id, role) => {
  if (![permission.admin, permission.sale_person]) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  const queryStaffId = db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 3, status: "active" });

  if (role === permission.sale_person) {
    queryStaffId.andWhere({ id: staff_id });
  }

  const resultStaff = await queryStaffId;
  if (resultStaff.length === 0) {
    throw validateError("Staff ID", 404);
  }

  const queryItemsId = db("order_items")
    .select("*")
    .where({ user_id, id: item_id, is_deleted: false });

  if (role === permission.sale_person) {
    queryItemsId.andWhere({ sale_id: staff_id });
  }

  const resultItem = await queryItemsId;
  if (resultItem.length === 0) {
    throw validateError("Order item id", 404);
  }

  return resultItem;
};

exports.getItemByStaffId = async (user_id, staff_id, role) => {
  if (![permission.admin].includes(role)) {
    throw validateError("No have permission");
  }

  await userIdValidate(user_id);

  const isStaffId = await db("staff")
    .select("*")
    .where({ user_id, id: staff_id, permission_lvl: 3, status: "active" })
    .first();
  if (!isStaffId) {
    throw validateError("Staff ID", 404);
  }

  const queryItem = await db("order_items")
    .select("*")
    .where({ user_id, sale_id: staff_id, is_deleted: false });

  if (queryItem.length === 0) {
    throw validateError("Query Item", 404);
  }

  return queryItem;
};

exports.getItemByOrderId = async (user_id, staff_id, order_id, role) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  let queryStaff = db("staff")
    .select("*")
    .where({ user_id, status: "active", permission_lvl: 3 });

  if (role === permission.sale_person) {
    queryStaff.andWhere({ id: staff_id });
  }

  const resultStaff = await queryStaff;
  if (resultStaff.length == 0) {
    throw validateError("Staff ID", 404);
  }

  let queryOrderId = db("orders")
    .select("*")
    .where({ user_id, is_deleted: false, id: order_id });

  if (role === permission.sale_person) {
    queryOrderId.andWhere({ sale_person: staff_id });
  }

  const resultOrderId = await queryOrderId;
  if (resultOrderId.length === 0) {
    throw validateError("Order ID", 404);
  }

  return queryOrderId;
};

exports.updateItems = async (user_id, staff_id, item_id, role, data) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  let isStaff = db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 3, status: "active" });

  if (role === permission.sale_person) {
    isStaff.andWhere({ id: staff_id });
  }

  const resultIsStaff = await isStaff;

  if (resultIsStaff.length === 0) {
    throw validateError("Staff ID", 404);
  }

  let isItemId = db("order_items")
    .select("*")
    .where({ user_id, is_deleted: false, id: item_id });

  if (role === permission.sale_person) {
    isItemId.andWhere({ sale_id: staff_id });
  }

  const resultItemId = await isItemId;
  if (resultItemId.length === 0) {
    throw validateError("Item ID", 404);
  }

  let updateQuery = db("order_items")
    .where({ user_id, is_deleted: false, id: item_id })
    .update({
      product_id: data.product_id,
      quantity: data.quantity,
      price: data.price,
    });

  if (role === permission.sale_person) {
    updateQuery = updateQuery.andWhere({ sale_id: staff_id });
  }

  const updated = await updateQuery;

  if (updated === 0) {
    throw validateError("No item found or not allowed to update", 404);
  }
};

exports.deleteItem = async (user_id, staff_id, item_id, role) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  let isStaff = db("staff")
    .select("*")
    .where({ user_id, status: "active", permission_lvl: 3 });
  if (role === permission.sale_person) {
    isStaff.andWhere({ id: staff_id });
  }

  const resultStaff = await isStaff;
  if (resultStaff.length === 0) {
    throw validateError("Staff ID", 404);
  }

  let isItemId = db("order_items")
    .select("*")
    .where({ user_id, id: item_id, is_deleted: false });

  if (role === permission.sale_person) {
    isItemId.andWhere({ sale_id: staff_id });
  }

  const resultItem = await isItemId;

  if (resultItem.length === 0) {
    throw validateError("Item ID", 404);
  }

  let isDelete = db("order_items")
    .update({ is_deleted: true })
    .where({ user_id, id: item_id, is_deleted: false });

  if (role === permission.sale_person) {
    isDelete = await isDelete.andWhere({ sale_id: staff_id });
  }
};
