const levelsController = require("../controller/levels.controller");
const { JWTAuth } = require("../middleware/JWTAuth.js");
const verifyApiKey = require("../middleware/apiKeyVerify.auth.js");

async function routes(fastify, option) {
  fastify.get("/get/levels", levelsController.getLevels);
  fastify.post("/post/levels", levelsController.createLeveles);
  fastify.get("/get/byid/:id", levelsController.getLevelById);
  fastify.put("/delete/levels/:id", levelsController.deleteLevel);
  fastify.put("/update/levels/:id", levelsController.updateLevel);
}

module.exports = routes;
