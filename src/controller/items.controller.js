const itemsService = require("../service/items.service.js");
const { handleController } = require("../utils/dbHelper.js");
const permission = require("../utils/permission.js");
const validateError = require("../utils/validateError.js");

exports.createItems = async (request, reply) => {
  const { user_id, staff_id: tokenStaffId, role } = request.user;
  const { order_id, items } = request.body;

  if (!Array.isArray(items) || items.length === 0) {
    return reply.status(400).send({
      message: "Items must be a non-empty array.",
    });
  }

  let finalStaffId;
  if (role === permission.admin) {
    if (!items.every((item) => item.staff_id)) {
      throw validateError("Each item must include staff_id for admin.", 400);
    }
  } else if (role === permission.sale_person) {
    finalStaffId = tokenStaffId;
    items.forEach((item) => {
      item.staff_id = finalStaffId;
    });
  } else {
    throw validateError("No permission to create items.", 403);
  }

  console.log("🟩 Final items:", items);

  await handleController(request, reply, itemsService.createItems, [
    user_id,
    tokenStaffId,
    order_id,
    role,
    items,
  ]);
};

exports.getAllItems = async (request, reply) => {
  const { user_id, role, staff_id: tokenStaffId } = request.user;
  await handleController(request, reply, itemsService.getAllItems, [
    user_id,
    tokenStaffId,
    role,
  ]);
};

exports.getItemById = async (request, reply) => {
  const { user_id, staff_id: tokenStaffId, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, itemsService.getItemById, [
    user_id,
    tokenStaffId,
    id,
    role,
  ]);
};

exports.getItemByStaffId = async (request, reply) => {
  const { user_id, role } = request.user;
  const staff_id = request.params.staff_id;
  console.log(staff_id);
  await handleController(request, reply, itemsService.getItemByStaffId, [
    user_id,
    staff_id,
    role,
  ]);
};

exports.getItemByOrderId = async (request, reply) => {
  const { user_id, staff_id: tokenStaffId, role } = request.user;
  const order_id = request.params.id;
  await handleController(request, reply, itemsService.getItemByOrderId, [
    user_id,
    tokenStaffId,
    order_id,
    role,
  ]);
};

exports.updateItems = async (request, reply) => {
  const { user_id, staff_id: tokenStaffId, role } = request.user;
  const data = request.body;
  const id = request.params.id;
  await handleController(request, reply, itemsService.updateItems, [
    user_id,
    tokenStaffId,
    id,
    role,
    data,
  ]);
};

exports.deleteItem = async (request, reply) => {
  const { user_id, staff_id: tokenStaffId, role } = request.user;
  const id = request.params.id;

  await handleController(request, reply, itemsService.deleteItem, [
    user_id,
    tokenStaffId,
    id,
    role,
  ]);
};
