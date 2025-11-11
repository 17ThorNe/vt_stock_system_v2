const stockLogService = require("../service/stocklog.service.js");
const { handleController } = require("../utils/dbHelper.js");
const permission = require("../utils/permission.js");
const validateError = require("../utils/validateError.js");

exports.getAllStockLog = async (request, reply) => {
  const { user_id, role } = request.user;
  await handleController(request, reply, stockLogService.getAllStockLog, [
    user_id,
    role,
  ]);
};

exports.importStock = async (request, reply) => {
  const { user_id, staff_id, role } = request.user;
  const data = request.body;
  await handleController(request, reply, stockLogService.importStock, [
    user_id,
    staff_id,
    role,
    data,
  ]);
};

exports.stockLogStats = async (request, reply) => {
  const { user_id, role } = request.user;
  await handleController(request, reply, stockLogService.getStockLogStats, [
    user_id,
    role,
  ]);
};
