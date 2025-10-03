const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");
const permission = require("../utils/permission.js");

exports.createOrder = async (user_id, sale_person, permissionRole, data) => {
  if (![permission.admin, permission.sale_person].includes(permissionRole)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  const checkSaleId = await db("staff")
    .where({
      user_id: user_id,
      permission_lvl: 3,
      status: "active",
    })
    .first();

  if (!checkSaleId) {
    throw validateError("Sale ID", 404);
  }

  const ordersArray = Array.isArray(data) ? data : [data];

  for (const order of ordersArray) {
    const customer = await db("customers")
      .where({
        id: order.customer_id,
        sale_person: sale_person,
        is_deleted: false,
      })
      .first();

    if (!customer) {
      throw validateError("Customer ID", 404);
    }
  }

  const dataToInsert = ordersArray.map((order) => ({
    ...order,
    sale_person,
    user_id,
  }));

  await db("orders").insert(dataToInsert);

  return { message: "Orders created successfully", count: dataToInsert.length };
};

exports.getAllOrder = async (
  user_id,
  sale_person,
  permissionRole,
  page = 1,
  limit = 10
) => {
  // 1. Permission check
  if (
    ![permission.admin, permission.inventory, permission.sale_person].includes(
      permissionRole
    )
  ) {
    throw validateError("No permission to view orders", 403);
  }

  // 2. Validate user exists
  await userIdValidate(user_id);

  // 3. Pagination setup
  const offset = (page - 1) * limit;

  let query = db("orders").where({ user_id, is_deleted: false });

  // 4. Role-based filter
  if (permissionRole === permission.sale_person) {
    query = query.andWhere({ sale_person });
  }

  // 5. Get data
  const result = await query.clone().select("*").limit(limit).offset(offset);

  // 6. Count total
  const [{ count }] = await query.clone().count("* as count");

  if (result.length === 0) {
    throw validateError("Order not found!", 404);
  }

  // 7. Return with pagination
  return {
    data: result,
    pagination: {
      total: Number(count),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

exports.getOrderById = async (
  user_id,
  sale_person,
  order_id,
  permissionRole
) => {
  if (
    ![permission.admin, permission.inventory, permission.sale_person].includes(
      permissionRole
    )
  ) {
    throw validateError("No have permission", 403);
  }
  if (permissionRole === permission.sale_person) {
    await userIdValidate(user_id);
    const result = await db("orders")
      .select("*")
      .where({ user_id, sale_person, id: order_id, is_deleted: false });

    if (result.length === 0) {
      throw validateError("Order", 404);
    }

    return result;
  } else {
    await userIdValidate(user_id);
    const result = await db("orders")
      .select("*")
      .where({ user_id, id: order_id, is_deleted: false });

    if (result.length === 0) {
      throw validateError("Order", 404);
    }
    return result;
  }
};

exports.updateOrder = async (
  user_id,
  sale_person,
  order_id,
  permissionRole,
  dataUpdate
) => {
  if (![permission.admin, permission.sale_person].includes(permissionRole)) {
    throw validateError("No have permission", 403);
  }
  await userIdValidate(user_id);
  const checkSaleId = await db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 3, status: "active" });

  if (checkSaleId.length === 0) {
    throw validateError("Sale person", 404);
  }

  const checkOrderId = await db("orders")
    .select("*")
    .where({ user_id, sale_person, id: order_id, is_deleted: false });

  if (checkOrderId.length === 0) {
    throw validateError("Order", 404);
  }

  await db("orders").update(dataUpdate);
};

exports.approveOrReject = async (
  user_id,
  inventoryManagerId,
  order_id,
  permissionRole,
  action
) => {
  if (![permission.admin, permission.inventory].includes(permissionRole)) {
    throw validateError("No permission to approve/reject orders", 403);
  }

  await userIdValidate(user_id);

  const order = await db("orders")
    .select("*")
    .where({ id: order_id, is_deleted: false })
    .first();

  if (!order) {
    throw validateError("Order not found", 404);
  }

  let newStatus;
  if (action === "approve") {
    newStatus = "APPROVED_BY_INVENTORY";
  } else if (action === "reject") {
    newStatus = "REJECTED_BY_INVENTORY";
  } else {
    throw validateError("Invalid action. Use approve/reject", 400);
  }

  const updated = await db("orders")
    .update({
      status: newStatus,
      inventory_manager_id: inventoryManagerId,
    })
    .where({ id: order_id, is_deleted: false });

  return { updatedRows: updated, newStatus };
};
