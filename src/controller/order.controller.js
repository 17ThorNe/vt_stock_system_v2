const orderService = require("../service/order.service.js");
const { handleController } = require("../utils/dbHelper.js");

exports.createOrder = async (request, reply) => {
  const { user_id, sale_id, role } = request.user;
  const data = request.body;
  await handleController(request, reply, orderService.createOrder, [
    user_id,
    sale_id,
    role,
    data,
  ]);
};
