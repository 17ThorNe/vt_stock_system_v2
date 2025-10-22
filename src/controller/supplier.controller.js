const supplierService = require("../service/supplier.service.js");
const { handleController } = require("../utils/dbHelper");
const permission = require("../utils/permission.js");

exports.createSupplier = async (request, reply) => {
  const { user_id, staff_id: staffTokenId, role } = request.user;
  const data = request.body;

  let finalStaffId;
  if (role === permission.admin) {
    finalStaffId = data.staff_id;
  } else if (role === permission.inventory) {
    finalStaffId = staffTokenId;
  }

  await handleController(request, reply, supplierService.createSupplier, [
    user_id,
    finalStaffId,
    role,
    data,
  ]);
};

exports.getAllSupplier = async (request, reply) => {
  const { user_id, role } = request.user;
  await handleController(request, reply, supplierService.getAllSupplier, [
    user_id,
    role,
  ]);
};

exports.getSupplierById = async (request, reply) => {
  const { user_id, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, supplierService.getSupplierById, [
    user_id,
    id,
    role,
  ]);
};

exports.updateSupplier = async (request, reply) => {
  const { user_id, staff_id: tokenStaffId, role } = request.user;
  const id = request.params.id;
  const data = request.body;

  let finalStaffId;

  if (role === permission.admin) {
    finalStaffId = data.staff_id;
  } else if (role === permission.inventory) {
    finalStaffId = tokenStaffId;
  }

  await handleController(request, reply, supplierService.updateSupplier, [
    user_id,
    id,
    finalStaffId,
    role,
    data,
  ]);
};

exports.deleteSupplier = async (request, reply) => {
  const { user_id, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, supplierService.deleteSupplier, [
    user_id,
    id,
    role,
  ]);
};
