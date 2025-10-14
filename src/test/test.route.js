const testController = require("./test.controller.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");
const { JWTAuth } = require("../middleware/JWTAuth.js");

async function testRoutes(fastify, option) {
  fastify.get(
    "/test-get",
    { preHandler: [verifyApiKey, JWTAuth] },
    testController.getTest
  );
}

module.exports = testRoutes;
