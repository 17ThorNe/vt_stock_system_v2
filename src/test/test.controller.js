const { handleController } = require("../utils/dbHelper.js");
const testService = require("./test.service.js");

exports.getTest = async (request, reply) => {
  const { user_id, staff_id, role } = request.user;
  await handleController(request, reply, testService.getTest, [
    user_id,
    staff_id,
  ]);
};
