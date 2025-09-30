const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");

const salePersonPermission = "sale_person";
const adminPermission = "sale_person";

exports.createCustomer = async (user_id, sale_id, permissinRole, data) => {
  await userIdValidate(user_id);
  const salePersons = await db("staff").where({
    user_id: user_id,
    permission_lvl: 2,
  });
  if (
    permissinRole === adminPermission ||
    permissinRole === salePersonPermission
  ) {
    if (salePersons.length === 0) {
      const error = new Error("Sale person not found!");
      error.statusCode = 404;
      throw error;
    }

    const finalDataToInsert = {
      ...data,
      user_id: user_id,
      sale_person: sale_id,
    };

    console.table(finalDataToInsert);

    await db("customers").insert(finalDataToInsert);
  } else {
    const error = new Error("You do not have permission to create customer");
    error.statusCode = 403;
    throw error;
  }
};

exports.getAllCustomer = async (user_id, sale_id, permissinRole) => {
  await userIdValidate(user_id);
  if (
    permissinRole === adminPermission ||
    permissinRole === salePersonPermission
  ) {
    const result = await db("customers")
      .select("*")
      .where({ user_id: user_id, sale_person: sale_id, is_deleted: false });
    return result;
  } else {
    const error = new Error("You can't view customer");
    error.statusCode = 403;
    throw error;
  }
};

exports.getCustomerById = async (user_id, sale_id, id, permissionRole) => {
  await userIdValidate(user_id);

  const saleId = await db("staff").select("*").where({
    user_id: user_id,
    id: sale_id,
    permission_lvl: 2, // ✅ salesperson role
    status: "active",
  });

  if (saleId.length === 0) {
    const error = new Error("Sale ID not found!");
    error.statusCode = 404;
    throw error;
  }

  // check customer
  const resultCustomer = await db("customers").where({
    user_id: user_id,
    sale_person: sale_id, // ✅ customers table column
    id: id,
    is_deleted: false,
  });

  if (resultCustomer.length === 0) {
    const error = new Error("Customer ID not found!");
    error.statusCode = 404;
    throw error;
  }

  // permission check
  if (permissionRole === "admin" || permissionRole === "sale_person") {
    return resultCustomer;
  } else {
    const error = new Error("Admin and Sale person only can view customer!");
    error.statusCode = 403;
    throw error;
  }
};
