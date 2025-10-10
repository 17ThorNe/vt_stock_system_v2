const stockLogService = require("../service/stocklog.service.js");
const { handleController } = require("../utils/dbHelper.js");
const permission = require("../utils/permission.js");
const validateError = require("../utils/validateError.js");

exports.getAllStockLog = async (request, reply) => {
  await handleController(request, reply, stockLogService.getAllStockLog, []);
};
