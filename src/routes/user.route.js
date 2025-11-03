const userController = require("../controller/user.controller.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");

async function routes(fastify, option) {
  fastify.get(
    "/users",
    { preHandler: [verifyApiKey, JWTAuth] },
    userController.getUser
  );
  fastify.post("/create", userController.createUser);
  fastify.post("/auth/login", userController.login);
  fastify.get(
    "/user/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    userController.getUserById
  );
  fastify.put(
    "/inactive/:id",
    { preHandler: [verifyApiKey, JWTAuth] },
    userController.inactiveAccount
  );
  fastify.get(
    "/auth/me",
    { preHandler: [verifyApiKey, JWTAuth] },
    userController.getMe
  );
}

module.exports = routes;
