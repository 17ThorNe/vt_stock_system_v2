const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const permission = require("../utils/permission.js");
const statusCodePermission = require("../utils/statusCodePermission.js");
const validateError = require("../utils/validateError.js");
const printf = require("../utils/printf.utils.js");

exports.createOrder = async (user_id, orders, role) => {
  await userIdValidate(user_id);

  if (![permission.admin, permission.sale_person].includes(role)) {
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

    if (role === permission.sale_person) {
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
  role,
  page = 1,
  limit = 10
) => {
  if (
    ![
      permission.admin,
      permission.inventory,
      permission.sale_person,
      permission.finance,
    ].includes(role)
  ) {
    throw validateError("No permission to view orders", 403);
  }

  await userIdValidate(user_id);

  const offset = (page - 1) * limit;

  let query = db("orders").where({ user_id, is_deleted: false });

  if (role === permission.sale_person) {
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

exports.getOrderById = async (user_id, sale_person, order_id, role) => {
  if (
    ![permission.admin, permission.inventory, permission.sale_person].includes(
      role
    )
  ) {
    throw validateError("No have permission", 403);
  }
  if (role === permission.sale_person) {
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
  role,
  dataUpdate
) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
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
  role,
  action
) => {
  // 1️⃣ Check permission
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission to approve or reject orders", 403);
  }

  await userIdValidate(user_id);

  // 2️⃣ Check inventory manager exists
  const staff = await db("staff")
    .where({
      user_id,
      id: inventoryManagerId,
      permission_lvl: 2,
      status: "active",
    })
    .first();
  if (!staff) throw validateError("Inventory Manager not found", 404);

  // 3️⃣ Check order exists and is pending
  const order = await db("orders")
    .where({ user_id, id: order_id, is_deleted: false })
    .first();
  if (!order) throw validateError("Order not found", 404);
  if (order.status !== "PENDING_APPROVAL")
    throw validateError("Order already processed", 400);

  // 4️⃣ Determine new status
  let newStatus;
  if (action === "approve") newStatus = "APPROVED_BY_INVENTORY";
  else if (action === "reject") newStatus = "REJECTED_BY_INVENTORY";
  else throw validateError("Invalid action type", 400);

  // 5️⃣ Update order status
  await db("orders").where({ id: order_id }).update({
    status: newStatus,
    inventory_manager_id: inventoryManagerId,
    updated_at: db.fn.now(),
  });

  // 6️⃣ If approved, update stock & create stock logs
  if (newStatus === "APPROVED_BY_INVENTORY") {
    const orderItems = await db("order_items").where({ order_id, user_id });

    for (const item of orderItems) {
      const { product_id, quantity } = item;

      const product = await db("products")
        .where({ id: product_id, user_id })
        .first();

      if (!product)
        throw validateError(`Product ID ${product_id} not found`, 404);

      const previousQty = product.quantity;
      const newQty = previousQty - quantity;

      if (newQty < 0)
        throw validateError(`Not enough stock for product ${product_id}`, 400);

      // Update product quantity
      await db("products")
        .where({ id: product_id, user_id })
        .update({ quantity: newQty });

      // Insert stock log
      await db("stocklogs").insert({
        user_id,
        staff_id: inventoryManagerId,
        product_id,
        order_id,
        stock_type: "out",
        p_stock: previousQty,
        n_stock: newQty,
        quantity,
        note: "Stock out after order approval",
      });
    }
  }
};

exports.deleteOrder = async (user_id, sale_person, order_id, role) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
    throw validateError("No have permission", 403);
  }
  await userIdValidate(user_id);
  const checkSalePerson = await db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 3, id: sale_person, status: "active" });

  if (checkSalePerson.length === 0) {
    throw validateError("Sale person", 404);
  }

  if (role === permission.admin) {
    const checkOrderId = await db("orders")
      .select("*")
      .where({ user_id, is_deleted: false, id: order_id });

    if (checkOrderId.length === 0) {
      throw validateError("Order ID", 404);
    }
  } else if (role === permission.sale_person) {
    const checkOrderId = await db("orders")
      .select("*")
      .where({ user_id, sale_person, is_deleted: false, id: order_id });

    if (checkOrderId.length === 0) {
      throw validateError("Order ID", 404);
    }
  }

  if (role === permission.sale_person) {
    await db("orders")
      .select("*")
      .where({ user_id, sale_person, is_deleted: false, id: order_id })
      .update({ is_deleted: true });
  } else if (role === permission.admin) {
    await db("orders")
      .select("*")
      .where({ user_id, is_deleted: false, id: order_id })
      .update({ is_deleted: true });
  }
};

exports.postTestRole = async (user_id, sale_person, role, data) => {
  console.log("User ID: ", user_id);
  console.log("Sale Person: ", sale_person);
  console.log("Permission role: ", role);
  console.log("Data to post:", data);
};

exports.financeApprovePayment = async (user_id, sale_person, orderId, role) => {
  console.log("Data: ", user_id, sale_person, orderId, role);

  if (![permission.admin, permission.finance].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  const checkStaffId = await db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 4, id: sale_person, status: "active" });

  console.log("checkstaff id:", checkStaffId);

  if (checkStaffId.length === 0) {
    throw validateError("Staff ID", 404);
  }

  const checkOrderId = await db("orders")
    .select("*")
    .where({ user_id, id: orderId, is_deleted: false });

  if (checkOrderId.length === 0) {
    throw validateError("Order ID", 404);
  }

  await db("orders")
    .select("*")
    .where({ user_id, id: orderId, is_deleted: false })
    .update({ status: "READY_FOR_PAYMENT", finance_id: sale_person });
};

exports.deliveryApprove = async (user_id, staff_id, order_id, role) => {
  console.log("User data: ", user_id, staff_id, order_id, role);
  await userIdValidate(user_id);

  if (![permission.admin, permission.delivery].includes(role)) {
    throw validateError(
      "No have permission",
      statusCodePermission.noHavePermission
    );
  }

  const checkStaffId = await db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 5, id: staff_id, status: "active" });

  if (checkStaffId.length === 0) {
    throw validateError("Staff ID", statusCodePermission.notFoundPermiision);
  }

  const checkOrderId = await db("orders")
    .select("*")
    .where({ user_id, id: order_id, is_deleted: false });

  if (checkOrderId.length === 0) {
    throw validateError("Order ID", statusCodePermission.notFoundPermiision);
  }

  await db("orders")
    .select("*")
    .where({ user_id, id: order_id, is_deleted: false })
    .update({ delivery_id: staff_id, status: "DELIVERED" });
};

exports.financeGetOrderApproved = async (userId, role) => {
  if (![permission.admin, permission.finance].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(userId);

  const resultGetOrder = await db("orders")
    .select("*")
    .where({
      user_id: userId,
      is_deleted: false,
      status: "APPROVED_BY_INVENTORY",
    });

  return resultGetOrder;
};
