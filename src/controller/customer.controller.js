const customerService = require("../service/customer.service.js");
const { handleController } = require("../utils/dbHelper.js");
const db = require("../config/knex.js");
const permission = require("../utils/permission.js");

exports.createCustomer = async (request, reply) => {
  const { user_id, role, staff_id: tokenSaleId } = request.user;
  const data = request.body;

  let finalSaleId;
  if (role === "admin") {
    finalSaleId = data.sale_person;
  } else if (role === "sale_person") {
    finalSaleId = tokenSaleId;
  }

  await handleController(request, reply, customerService.createCustomer, [
    user_id,
    finalSaleId,
    role,
    data,
  ]);
};

exports.getAllCustomer = async (request, reply) => {
  const { user_id, role } = request.user;
  const { staff_id } = request.user;
  await handleController(request, reply, customerService.getAllCustomer, [
    user_id,
    staff_id,
    role,
  ]);
};

exports.getCustomerById = async (request, reply) => {
  const { user_id, role, staff_id } = request.user;
  const id = request.params.id;
  await handleController(request, reply, customerService.getCustomerById, [
    user_id,
    staff_id,
    id,
    role,
  ]);
};

exports.getCustomerBySaleId = async (request, reply) => {
  const { user_id, role } = request.user;
  const staff_id = request.params.staff_id;

  await handleController(request, reply, customerService.getCustomerBySaleId, [
    user_id,
    staff_id,
    role,
  ]);
};

exports.updateCustomer = async (request, reply) => {
  const { user_id, role, staff_id: tokenStaffId } = request.user;
  const id = request.params.id;
  const data = request.body;

  let finalStaffId;
  if (role === permission.admin) {
    finalStaffId = data.sale_person;
  } else if (role === permission.sale_person) {
    finalStaffId = tokenStaffId;
  }

  await handleController(request, reply, customerService.updateCustomer, [
    user_id,
    finalStaffId,
    id,
    role,
    data,
  ]);
};

exports.deleteCustomer = async (request, reply) => {
  const { user_id, staff_id: tokenStaffId, role } = request.user;
  const id = request.params.id;
  await handleController(request, reply, customerService.deleteCustomer, [
    user_id,
    tokenStaffId,
    id,
    role,
  ]);
};
