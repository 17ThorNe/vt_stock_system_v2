const userController = require("../controller/user.controller.js");

async function routes(fastify, option) {
  fastify.get("/users", userController.getUser);
  fastify.post("/create", userController.createUser);
  fastify.get("/user/:id", userController.getUserById);
}

module.exports = routes;
