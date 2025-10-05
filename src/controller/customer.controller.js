const customerService = require("../service/customer.service.js");
const { handleController } = require("../utils/dbHelper.js");
const db = require("../config/knex.js");

exports.createCustomer = async (request, reply) => {
  const { user_id, role, sale_id: tokenSaleId } = request.user;
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
  const { sale_id } = request.user;
  await handleController(request, reply, customerService.getAllCustomer, [
    user_id,
    sale_id,
    role,
  ]);
};

exports.getCustomerById = async (request, reply) => {
  const { user_id, role, sale_id } = request.user;
  const id = request.params.id;
  await handleController(request, reply, customerService.getCustomerById, [
    user_id,
    sale_id,
    id,
    role,
  ]);
};

exports.getCustomerBySaleId = async (request, reply) => {
  const { user_id, role } = request.user;
  const sale_id = request.params.sale_id;

  await handleController(request, reply, customerService.getCustomerBySaleId, [
    user_id,
    sale_id,
    role,
  ]);
};
