const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");
const permission = require("../utils/permission.js");
const statusCodePermission = require("../utils/statusCodePermission.js");
const logJSON = require("../utils/logJSON.js");

exports.createOrderItems = async (
  user_id,
  staff_id,
  order_id,
  permissionRole,
  data
) => {
  if (![permission.admin, permission.sale_person].includes(permissionRole)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  let customStaffQeury = db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 3, status: "active" });

  if (permissionRole === permission.sale_person) {
    customStaffQeury.andWhere({ id: staff_id });
  }

  const checkStaff = await customStaffQeury;
  if (checkStaff.length === 0) {
    throw validateError("Staff ID not found or inactive", 404);
  }

  let orderQuery = db("orders")
    .select("*")
    .where({ user_id, id: order_id, is_deleted: false });

  if (permissionRole === permission.sale_person) {
    orderQuery.andWhere({ sale_person: staff_id });
  }

  const checkOrderQuery = await orderQuery;
  if (checkOrderQuery.length === 0) {
    throw validateError("Order ID not found", 404);
  }

  if (!Array.isArray(data)) {
    throw validateError("Data must be an array of items", 400);
  }

  const finalDataToInsert = data.map((item) => ({
    order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  await db("order_items").insert(finalDataToInsert);
};
