const levelsService = require("../service/levels.service.js");
const { handleController } = require("../utils/dbHelper.js");

exports.getLevels = async (request, reply) => {
  await handleController(request, reply, levelsService.getAllLevels);
};

exports.createLeveles = async (request, reply) => {
  const dataLevels = request.body;
  await handleController(request, reply, levelsService.createLevels, [
    dataLevels,
  ]);
};

exports.getLevelById = async (request, reply) => {
  const id = request.params.id;
  await handleController(request, reply, levelsService.getLevelById, [id]);
};

exports.updateLevel = async (request, reply) => {
  try {
    const id = request.params.id;
    const dataLevel = request.body;
    await levelsService.updateLevel(id, dataLevel);
    reply.code(200).send({ status: "success" });
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
