const userService = require("../service/user.service.js");
const { handleController } = require("../utils/dbHelper.js");

exports.getUser = async (request, reply) => {
  try {
    const users = await userService.getAllUsers();
    reply.code(200).send({ status: "success", users });
  } catch (err) {
    reply.code(500).send({ error: "Database error" });
  }
};

exports.getUserById = async (request, reply) => {
  try {
    const id = request.params.id;
    const result = await userService.getUserByIdService(id);
    reply.code(200).send({ status: "success", result });
  } catch (error) {
    reply
      .code(error.statusCode || 500)
      .send({ error: error.message || "Database error" });
  }
};

exports.createUser = async (request, reply) => {
  try {
    const user = request.body;
    await userService.createUser(user);
    reply.code(201).send({ message: "success" });
  } catch (error) {
    const status = error.statusCode || 500;
    reply.code(status).send({ error: error.message });
  }
};

exports.login = async (request, reply) => {
  const { email, password } = request.body;
  await handleController(request, reply, userService.loginService, [
    email,
    password,
  ]);
};
