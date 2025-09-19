const levelsService = require("../service/levels.service.js");

exports.getLevels = async (request, reply) => {
  try {
    const result = await levelsService.getAllLevels();
    reply.code(201).send({ status: "success", result });
  } catch (error) {
    reply
      .code(error.statusCode || 500)
      .send({ error: error.message || "Database error" });
  }
};

exports.createLeveles = async (request, reply) => {
  try {
    const dataLevels = request.body;
    await levelsService.createLevels(dataLevels);
    reply.code(201).send({ status: "success" });
  } catch (error) {
    reply
      .code(error.statusCode || 500)
      .send({ error: error.message || "Database error" });
  }
};

exports.getLevelById = async (request, reply) => {
  try {
    const id = request.params.id;
    const data = await levelsService.getLevelById(id);
    reply.code(200).send({ status: "success", data });
  } catch (error) {
    reply
      .code(error.statusCode || 500)
      .send({ error: error.message || "Database error" });
  }
};

exports.deleteLevel = async (request, reply) => {
  try {
    const id = request.params.id;
    const data = await levelsService.deleteLevelById(id);
    reply.code(200).send(data);
  } catch (error) {
    reply
      .code(error.statusCode || 500)
      .send({ error: error.message || "Database error" });
  }
};
