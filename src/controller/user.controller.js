const userService = require("../service/user.service.js");

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
    reply.code(500).send({ error: "Database error" });
  }
};
