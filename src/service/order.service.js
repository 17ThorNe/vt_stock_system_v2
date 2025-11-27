const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const permission = require("../utils/permission.js");
const statusCodePermission = require("../utils/statusCodePermission.js");
const validateError = require("../utils/validateError.js");

exports.createOrder = async (user_id, orders, role) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  // Since you send only ONE order → take first item
  const order = orders[0]; // ← your frontend sends one object in array

  const { customer_id, total_price, sale_person } = order;

  const customer = await db("customers")
    .where({ id: customer_id, is_deleted: 0 })
    .first();
  if (!customer) {
    throw validateError(`Customer ID ${customer_id} not found`, 404);
  }

  const salePerson = await db("staff")
    .where({ id: sale_person, permission_lvl: 3, status: "active" })
    .first();
  if (!salePerson) {
    throw validateError(`Sale person ID ${sale_person} not found`, 404);
  }

  const orderToInsert = {
    user_id,
    customer_id,
    sale_person,
    total_price: total_price || 0.0,
    status: "pending",
    is_deleted: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Insert and return only the ID
  const [orderId] = await db("orders").insert(orderToInsert).returning("id");

  return orderId;
};

exports.getAllOrder = async (
  user_id,
  sale_person,
  role,
  page = 1,
  limit = 10
) => {
  // ---------- 1. Permission check ----------
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

  // ---------- 2. Fetch orders with staff ----------
  let orderQuery = db("orders AS o")
    .leftJoin("staff AS s", "o.sale_person", "s.id")
    .where("o.user_id", user_id)
    .andWhere("o.is_deleted", 0);

  if (role === permission.sale_person) {
    orderQuery = orderQuery.andWhere("o.sale_person", sale_person);
  }

  // ---------- 3. Fetch paginated orders ----------
  const orders = await orderQuery
    .clone()
    .select("o.*", "s.fullname AS sale_name", "s.id AS staff_id")
    .limit(limit)
    .offset(offset);

  // ---------- 4. Count total ----------
  const [{ count }] = await orderQuery.clone().count("* as count");

  if (orders.length === 0) {
    throw validateError("Order not found!", 200);
  }

  const orderIds = orders.map((o) => o.id);

  const items = await db("order_items AS oi")
    .leftJoin("products AS p", "oi.product_id", "p.id")
    .whereIn("oi.order_id", orderIds)
    .select(
      "oi.id AS item_id",
      "oi.order_id",
      "oi.product_id",
      "oi.quantity",
      "oi.price",
      "p.name AS product_name",
      "p.description AS product_description",
      "p.sku AS product_sku",
      "p.default_cost AS product_default_cost",
      "p.default_price AS product_default_price",
      "p.product_img AS product_img",
      "p.status AS product_status"
    );

  const data = orders.map((order) => ({
    ...order,
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        id: item.item_id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product_id,
          name: item.product_name,
          description: item.product_description,
          sku: item.product_sku,
          default_cost: item.product_default_cost,
          default_price: item.product_default_price,
          product_img: item.product_img,
          status: item.product_status,
        },
      })),
  }));

  return {
    data,
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

  await userIdValidate(user_id);

  let query = db("orders AS o")
    .leftJoin("order_items AS oi", "oi.order_id", "o.id")
    .leftJoin("products AS p", "p.id", "oi.product_id")
    .select(
      // Orders
      "o.id AS order_id",
      "o.user_id AS order_user_id",
      "o.customer_id AS order_customer_id",
      "o.sale_person AS order_sale_person",
      "o.total_price AS order_total_price",
      "o.status AS order_status",
      "o.is_deleted AS order_is_deleted",
      "o.created_at AS order_created_at",
      "o.updated_at AS order_updated_at",

      // Order Items
      "oi.id AS item_id",
      "oi.quantity AS item_quantity",
      "oi.created_at AS item_created_at",
      "oi.updated_at AS item_updated_at",

      // Products
      "p.id AS product_id",
      "p.name AS product_name",
      "p.description AS product_description",
      "p.sku AS product_sku",
      "p.default_cost AS product_default_cost",
      "p.default_price AS product_default_price",
      "p.product_img AS product_img",
      "p.status AS product_status"
    )
    .where("o.is_deleted", 0)
    .andWhere("o.user_id", user_id)
    .andWhere("o.id", order_id);

  // ---------- 3. Filter for sale_person role ----------
  if (role === permission.sale_person) {
    query = query.andWhere("o.sale_person", sale_person);
  }

  // ---------- 4. Execute query ----------
  const rows = await query;

  if (rows.length === 0) {
    throw validateError("Order not found", 404);
  }

  // ---------- 5. Format order and items ----------
  const order = {
    id: rows[0].order_id,
    user_id: rows[0].order_user_id,
    customer_id: rows[0].order_customer_id,
    sale_person: rows[0].order_sale_person,
    total_price: rows[0].order_total_price,
    status: rows[0].order_status,
    is_deleted: rows[0].order_is_deleted,
    created_at: rows[0].order_created_at,
    updated_at: rows[0].order_updated_at,
  };

  const items = rows
    .filter((r) => r.item_id) // only include if item exists
    .map((row) => ({
      item: {
        id: row.item_id,
        quantity: row.item_quantity,
        created_at: row.item_created_at,
        updated_at: row.item_updated_at,
      },
      product: {
        id: row.product_id,
        name: row.product_name,
        description: row.product_description,
        sku: row.product_sku,
        default_cost: row.product_default_cost,
        default_price: row.product_default_price,
        product_img: row.product_img,
        status: row.product_status,
      },
    }));

  // ---------- 6. Return final structured result ----------
  return { order, items };
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
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No permission to approve or reject orders", 403);
  }

  await userIdValidate(user_id);

  const staff = await db("staff")
    .where({
      user_id,
      id: inventoryManagerId,
      permission_lvl: 2,
      status: "active",
    })
    .first();
  if (!staff) throw validateError("Inventory Manager not found", 404);

  const order = await db("orders")
    .where({ user_id, id: order_id, is_deleted: false })
    .first();
  if (!order) throw validateError("Order not found", 404);
  if (order.status !== "PENDING_APPROVAL")
    throw validateError("Order already processed", 400);

  let newStatus;
  if (action === "approve") newStatus = "APPROVED_BY_INVENTORY";
  else if (action === "reject") newStatus = "REJECTED_BY_INVENTORY";
  else throw validateError("Invalid action type", 400);

  await db("orders").where({ id: order_id }).update({
    status: newStatus,
    inventory_manager_id: inventoryManagerId,
    updated_at: db.fn.now(),
  });

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

      await db("products")
        .where({ id: product_id, user_id })
        .update({ quantity: newQty });

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

  const resultGetOrder = await db("orders").select("*").where({
    user_id: userId,
    is_deleted: false,
    status: "APPROVED_BY_INVENTORY",
  });

  return resultGetOrder;
};
