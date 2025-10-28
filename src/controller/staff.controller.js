const { handleController } = require("../utils/dbHelper.js");
const staffService = require("../service/staff.service.js");

exports.createStaff = async (request, reply) => {
  const user_id = request.user.id;
  const { role } = request.user;
  const staffData = request.body;
  await handleController(request, reply, staffService.createStaff, [
    user_id,
    staffData,
    role,
  ]);
};

exports.getAllStaff = async (request, reply) => {
  const user_id = request.user.user_id;
  const { role } = request.user;
  await handleController(request, reply, staffService.getAllStaff, [
    user_id,
    role,
  ]);
};

exports.getStaffById = async (request, reply) => {
  const id = request.params.id;
  const user_id = request.user.user_id;
  console.log(user_id);
  await handleController(request, reply, staffService.getStaffById, [
    id,
    user_id,
  ]);
};

exports.updateStaff = async (request, reply) => {
  const id = request.params.id;
  const user_id = request.user.id;
  const staffData = request.body;
  await handleController(request, reply, staffService.updateStaff, [
    id,
    user_id,
    staffData,
  ]);
};

exports.deleteStaff = async (request, reply) => {
  const id = request.params.id;
  const user_id = request.user.id;
  await handleController(request, reply, staffService.deleteStaff, [
    id,
    user_id,
  ]);
};
