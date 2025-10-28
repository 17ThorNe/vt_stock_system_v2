const uploadService = require("../service/upload.service.js");

exports.uploadImage = async (request, reply) => {
  try {
    const file = await request.file();
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
