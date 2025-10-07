const orderItemService = require("../service/orderItems.service.js");
const { handleController } = require("../utils/dbHelper.js");
const permission = require("../utils/permission.js");

exports.createOrderItems = async (request, reply) => {
  const { user_id, sale_id: tokenStaffId, role } = request.user;
  const { order_id, items } = request.body;
  await handleController(request, reply, orderItemService.createOrderItems, [
    user_id,
    tokenStaffId,
    order_id,
    role,
    items,
  ]);
};
