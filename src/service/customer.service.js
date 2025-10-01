const db = require("../config/knex.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");

const salePersonPermission = "sale_person";
const adminPermission = "admin";

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

exports.getAllCustomer = async (user_id, sale_id, permissionRole) => {
  await userIdValidate(user_id);

  if (permissionRole === adminPermission) {
    return await db("customers")
      .select("*")
      .where({ user_id: user_id, is_deleted: false });
  }

  if (permissionRole === salePersonPermission) {
    if (!sale_id) {
      const error = new Error("Sale person ID is required!");
      error.statusCode = 400;
      throw error;
    }
    return await db("customers")
      .select("*")
      .where({ user_id: user_id, sale_person: sale_id, is_deleted: false });
  }

  const error = new Error("You can't view customer");
  error.statusCode = 403;
  throw error;
};

exports.getCustomerById = async (user_id, sale_id, id, permissionRole) => {
  await userIdValidate(user_id);

  if (
    permissionRole !== adminPermission &&
    permissionRole !== salePersonPermission
  ) {
    throw validateError("You no have permission", 403);
  }

  if (permissionRole === adminPermission) {
    const result = await db("customers")
      .select("*")
      .where({ user_id: user_id, is_deleted: false, id: id })
      .first();
    return result;
  }

  if (permissionRole === salePersonPermission) {
    const result = await db("customers")
      .select("*")
      .where({ user_id: user_id, sale_person: sale_id, id: id })
      .first();
    if (!result) {
      throw validateError("Customer", 404);
    }

    return result;
  }
};

exports.getCustomerBySaleId = async (user_id, sale_person, permissinRole) => {
  await userIdValidate(user_id);

  const resultStaff = await db("staff")
    .select("*")
    .where({ user_id: user_id, permission_lvl: 2, status: "active" });

  if (!resultStaff) {
    throw validateError("Staff", 404);
  }

  if (permissinRole === adminPermission) {
    const resultCustomer = await db("customers").select("*").where({
      user_id: user_id,
      sale_person: sale_person,
      is_deleted: false,
    });
    if (resultCustomer.length === 0) {
      throw validateError("Customer not found!", 404);
    }
    return resultCustomer;
  }

  if (permissinRole !== adminPermission) {
    throw validateError("No permission", 403);
  }
};
