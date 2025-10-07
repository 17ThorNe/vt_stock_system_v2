const uploadService = require("../service/upload.service.js");

exports.uploadImage = async (request, reply) => {
  try {
    // Use Fastify's multipart method
    const file = await request.file(); // get uploaded file stream
    const result = await uploadService.saveImage(file);

    reply.send({
      status: "success",
      data: result,
    });
  } catch (error) {
    reply.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};
