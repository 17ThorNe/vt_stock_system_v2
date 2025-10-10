const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");
const permission = require("../utils/permission.js");
const printf = require("../utils/printf.utils.js");
const logJSON = require("../utils/logJSON.js");

exports.getAllStockLog = async (userId, staffId, role) => {
  printf("Hello stock log");
};
