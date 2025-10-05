const orderService = require("../service/order.service.js");
const { handleController } = require("../utils/dbHelper.js");
const permission = require("../utils/permission.js");

exports.createOrder = async (request, reply) => {
  try {
    const { user_id, sale_id, role } = request.user;
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
        finalSaleId = sale_id;
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

exports.inventoryManagerApproveOrReject = async (request, reply) => {
  const { user_id, role, sale_id } = request.user;
  const id = request.params.id;
  const { action } = request.body;
  await handleController(
    request,
    reply,
    orderService.inventoryManagerApproveOrReject,
    [user_id, sale_id, id, role, action]
  );
};

exports.deleteOrder = async (request, reply) => {
  const { user_id, role, sale_id } = request.user;
  const id = request.params.id;
  await handleController(request, reply, orderService.deleteOrder, [
    user_id,
    sale_id,
    id,
    role,
  ]);
};

exports.postTestRole = async (request, reply) => {
  const { user_id, role, sale_id } = request.user;
  const data = request.body;

  let supportSaleId;
  if (role === permission.admin) {
    supportSaleId = data.sale_person_id;
  } else if (role === permission.sale_person) {
    supportSaleId = sale_id;
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
