const levelsController = require("../controller/levels.controller");

async function routes(fastify, option) {
  fastify.get("/get/levels", levelsController.getLevels);
  fastify.post("/post/levels", levelsController.createLeveles);
  fastify.get("/get/byid/:id", levelsController.getLevelById);
  fastify.put("/delete/levels/:id", levelsController.deleteLevel);
}

module.exports = routes;
