const orderService = require("../service/order.service.js");
const { handleController } = require("../utils/dbHelper.js");
const permission = require("../utils/permission.js");
const validateError = require("../utils/validateError.js");

exports.createOrder = async (request, reply) => {
  try {
    const { user_id, staff_id, role } = request.user;
    let orders = request.body;

    if (!Array.isArray(orders)) {
      orders = [orders];
    }

    const processedOrders = orders.map((order) => {
      let finalSaleId;

      if (role === permission.admin) {
        if (!order.sale_person) {
          throw validateError("sale_person is required for admin", 400);
        }
        finalSaleId = order.sale_person;
      } else if (role === permission.sale_person) {
        finalSaleId = staff_id;
      } else {
        throw validateError("No have permission", 403);
      }

      return {
        ...order,
        sale_person: finalSaleId,
      };
    });

    await handleController(request, reply, orderService.createOrder, [
      user_id,
      processedOrders,
      role,
    ]);
  } catch (error) {
    reply.code(error.statusCode || 500).send({ message: error.message });
  }
};

exports.getAllOrders = async (request, reply) => {
  try {
    const { user_id, staff_id, role } = request.user;
    const { page = 1, limit = 10 } = request.query;

    const result = await orderService.getAllOrder(
      user_id,
      staff_id,
      role,
      Number(page),
      Number(limit)
    );

    reply.code(200).send({
      status: "success",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("GetAllOrders error:", err.message);

    reply.code(err.statusCode || 500).send({
      status: "error",
      message: err.message || "Internal Server Error",
    });
  }
};

exports.getOrderById = async (request, reply) => {
  const { user_id, staff_id, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, orderService.getOrderById, [
    user_id,
    staff_id,
    id,
    role,
  ]);
};

exports.updateOrder = async (request, reply) => {
  const { user_id, staff_id, role } = request.user;
  const id = request.params.id;
  const dataUpdate = request.body;
  await handleController(request, reply, orderService.updateOrder, [
    user_id,
    staff_id,
    id,
    role,
    dataUpdate,
  ]);
};

exports.inventoryManagerApproveOrReject = async (request, reply) => {
  const { user_id, role, staff_id: tokenStaffID } = request.user;
  const id = request.params.id;
  const { action, staff_id } = request.body;

  let finalStaffId;
  if (role === permission.admin) {
    finalStaffId = staff_id;
  } else if (role === permission.inventory) {
    finalStaffId = tokenStaffID;
  }

  await handleController(
    request,
    reply,
    orderService.inventoryManagerApproveOrReject,
    [user_id, finalStaffId, id, role, action]
  );
};

exports.deleteOrder = async (request, reply) => {
  const { user_id, role, staff_id } = request.user;
  const id = request.params.id;
  await handleController(request, reply, orderService.deleteOrder, [
    user_id,
    staff_id,
    id,
    role,
  ]);
};

exports.postTestRole = async (request, reply) => {
  const { user_id, role, staff_id } = request.user;
  const data = request.body;

  let supportSaleId;
  if (role === permission.admin) {
    supportSaleId = data.sale_person_id;
  } else if (role === permission.sale_person) {
    supportSaleId = staff_id;
  }

  if (!supportSaleId) {
    const error = new Error("Sale ID require!");
    error.statusCode = 400;
    throw error;
  }

  await handleController(request, reply, orderService.postTestRole, [
    user_id,
    supportSaleId,
    role,
    data,
  ]);
};

exports.financeApprovePayment = async (request, reply) => {
  const { user_id, role, staff_id: tokenStaffId } = request.user;
  const id = request.params.id;
  const data = request.body;

  let finalStaffId;
  if (role === permission.admin) {
    finalStaffId = data.staff_id;
  } else if (role === permission.finance) {
    finalStaffId = tokenStaffId;
  }

  await handleController(request, reply, orderService.financeApprovePayment, [
    user_id,
    finalStaffId,
    id,
    role,
  ]);
};

exports.deliveryApprove = async (request, reply) => {
  const { user_id, staff_id: tokenStaffId, role } = request.user;
  const id = request.params.id;
  const { staff_id } = request.body;

  let finalStaffId;
  if (role === permission.admin) {
    finalStaffId = staff_id;
  } else if (role === permission.delivery) {
    finalStaffId = tokenStaffId;
  }
  await handleController(request, reply, orderService.deliveryApprove, [
    user_id,
    finalStaffId,
    id,
    role,
  ]);
};

exports.financeGetOrderApproved = async (request, reply) => {
  const { user_id, staff_id, role } = request.user;
  await handleController(request, reply, orderService.financeGetOrderApproved, [
    user_id,
    role,
  ]);
};
