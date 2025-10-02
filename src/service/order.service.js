const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");

const permission = {
  admin: "admin",
  inventory: "inventory_mananger",
  sale_person: "sale_person",
};

exports.createOrder = async (user_id, sale_person, permissionRole, data) => {
  if (![permission.admin, permission.sale_person].includes(permissionRole)) {
    throw validateError("No have permission", 403);
  }

  const checkSaleId = await db("staff").where({
    user_id: user_id,
    permission_lvl: 3,
    status: "active",
  });

  if (!checkSaleId) {
    throw validateError("Sale ID", 404);
  }

  const finishedToInsertData = {
    ...data,
    sale_person,
  };

  console.log("Hello data to post ", finishedToInsertData);

  await userIdValidate(user_id);
};
