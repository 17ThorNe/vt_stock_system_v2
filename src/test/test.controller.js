const { handleController } = require("../utils/dbHelper.js");
const testService = require("./test.service.js");

exports.getTest = async (request, reply) => {
  const { user_id, staff_id, role } = request.user;
  console.log("User ID: ", user_id);
  console.log("Staff Id: ", staff_id);
  console.log("Rold : ", role);
  // await handleController(request, reply, testService.getTest, [
  //   user_id,
  //   staff_id,
  // ]);
};
