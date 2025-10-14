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
