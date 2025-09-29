const userController = require("../controller/user.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function routes(fastify, option) {
  fastify.get("/users", { preHandler: [JWTAuth] }, userController.getUser);
  fastify.post("/create", userController.createUser);
  fastify.post("/login", userController.login);
  fastify.get(
    "/user/:id",
    { preHandler: [JWTAuth] },
    userController.getUserById
  );
  fastify.put(
    "/inactive/:id",
    { preHandler: [JWTAuth] },
    userController.inactiveAccount
  );
}

module.exports = routes;
