const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");
const permission = require("../utils/permission.js");
const { data } = require("react-router-dom");

exports.createOrder = async (user_id, orders, permissionRole) => {
  await userIdValidate(user_id);

  if (![permission.admin, permission.sale_person].includes(permissionRole)) {
    throw validateError("No have permission", 403);
  }

  for (const order of orders) {
    const saleId = order.sale_person;

    const salePerson = await db("staff")
      .where({ id: saleId, permission_lvl: 3, status: "active" })
      .first();

    if (!salePerson) {
      throw validateError(`Sale person ID ${saleId} not found`, 404);
    }

    let customerQuery = db("customers").where({
      id: order.customer_id,
      is_deleted: false,
    });

    if (permissionRole === permission.sale_person) {
      customerQuery.andWhere({ sale_person: saleId });
    }

    const customer = await customerQuery.first();
    if (!customer) {
      throw validateError(`Customer ID ${order.customer_id} not found`, 404);
    }
  }

  const dataToInsert = orders.map((order) => ({
    ...order,
    user_id,
  }));
  await db("orders").insert(dataToInsert);
};

exports.getAllOrder = async (
  user_id,
  sale_person,
  permissionRole,
  page = 1,
  limit = 10
) => {
  if (
    ![permission.admin, permission.inventory, permission.sale_person].includes(
      permissionRole
    )
  ) {
    throw validateError("No permission to view orders", 403);
  }

  await userIdValidate(user_id);

  const offset = (page - 1) * limit;

  let query = db("orders").where({ user_id, is_deleted: false });

  if (permissionRole === permission.sale_person) {
    query = query.andWhere({ sale_person });
  }

  const result = await query.clone().select("*").limit(limit).offset(offset);

  const [{ count }] = await query.clone().count("* as count");

  if (result.length === 0) {
    throw validateError("Order not found!", 404);
  }

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

exports.inventoryManagerApproveOrReject = async (
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

exports.deleteOrder = async (
  user_id,
  sale_person,
  order_id,
  permissionRole
) => {
  if (![permission.admin, permission.sale_person].includes(permissionRole)) {
    throw validateError("No have permission", 403);
  }
  await userIdValidate(user_id);
  const checkSalePerson = await db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 3, status: "active" });

  if (checkSalePerson.length === 0) {
    throw validateError("Sale person", 404);
  }

  if (permissionRole === permission.admin) {
    const checkOrderId = await db("orders")
      .select("*")
      .where({ user_id, is_deleted: false, id: order_id });

    if (checkOrderId.length === 0) {
      throw validateError("Order ID", 404);
    }
  } else if (permissionRole === permission.sale_person) {
    const checkOrderId = await db("orders")
      .select("*")
      .where({ user_id, sale_person, is_deleted: false, id: order_id });

    if (checkOrderId.length === 0) {
      throw validateError("Order ID", 404);
    }
  }

  if (permissionRole === permission.sale_person) {
    await db("orders")
      .select("*")
      .where({ user_id, sale_person, is_deleted: false, id: order_id })
      .update({ is_deleted: true });
  } else if (permissionRole === permission.admin) {
    await db("orders")
      .select("*")
      .where({ user_id, is_deleted: false, id: order_id })
      .update({ is_deleted: true });
  }
};

exports.postTestRole = async (user_id, sale_person, permissionRole, data) => {
  console.log("User ID: ", user_id);
  console.log("Sale Person: ", sale_person);
  console.log("Permission role: ", permissionRole);
  console.log("Data to post:", data);
};

exports.financeApprovePayment = async (
  user_id,
  sale_person,
  permissionRole,
  data
) => {
   
};
