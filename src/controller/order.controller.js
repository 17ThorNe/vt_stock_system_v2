const orderService = require("../service/order.service.js");
const { handleController } = require("../utils/dbHelper.js");

exports.createOrder = async (request, reply) => {
  const { user_id, sale_id, role } = request.user;
  const data = request.body;
  await handleController(request, reply, orderService.createOrder, [
    user_id,
    sale_id,
    role,
    data,
  ]);
};

exports.getAllOrders = async (request, reply) => {
  try {
    const { user_id, sale_id, role } = request.user;
    const { page = 1, limit = 10 } = request.query;

    const result = await orderService.getAllOrder(
      user_id,
      sale_id,
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
  const { user_id, sale_id, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, orderService.getOrderById, [
    user_id,
    sale_id,
    id,
    role,
  ]);
};

exports.updateOrder = async (request, reply) => {
  const { user_id, sale_id, role } = request.user;
  const id = request.params.id;
  const dataUpdate = request.body;
  await handleController(request, reply, orderService.updateOrder, [
    user_id,
    sale_id,
    id,
    role,
    dataUpdate,
  ]);
};

exports.approveOrReject = async (request, reply) => {
  const { user_id, role, sale_id } = request.user;
  const id = request.params.id;
  const { action } = request.body;
  await handleController(request, reply, orderService.approveOrReject, [
    user_id,
    sale_id,
    id,
    role,
    action,
  ]);
};
