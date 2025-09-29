const userService = require("../service/user.service.js");
const { handleController } = require("../utils/dbHelper.js");

exports.getUser = async (request, reply) => {
  console.log("Request User:", request.user.id);
  await handleController(request, reply, userService.getAllUsers);
};

exports.getUserById = async (request, reply) => {
  const id = request.params.id;
  await handleController(request, reply, userService.getUserByIdService, [id]);
};

exports.createUser = async (request, reply) => {
  const user = request.body;
  await handleController(request, reply, userService.createUser, [user]);
};

exports.login = async (request, reply) => {
  const { email, password } = request.body;
  await handleController(request, reply, userService.loginService, [
    email,
    password,
  ]);
};

exports.inactiveAccount = async (request, reply) => {
  const id = request.params.id;
  const currentUserLevel = request.user.level_id;
  await handleController(request, reply, userService.inActiveAccount, [
    id,
    currentUserLevel,
  ]);
};
