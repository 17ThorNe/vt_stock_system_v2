const path = require("path");
const uploadController = require("../controller/upload.controller.js");

async function uploadRoutes(fastify) {
  fastify.post("/upload/image", async (req, reply) => {
    await uploadController.uploadImage(req, reply);
  });
}

module.exports = uploadRoutes;
