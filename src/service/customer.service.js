const db = require("../config/knex.js");
const permission = require("../utils/permission.js");
const statusCodePermission = require("../utils/statusCodePermission.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");

exports.createCustomer = async (user_id, staff_id, permissinRole, data) => {
  await userIdValidate(user_id);
  const salePersons = await db("staff").where({
    user_id: user_id,
    permission_lvl: 3,
  });

  if (
    permissinRole === permission.admin ||
    permissinRole === permission.sale_person
  ) {
    if (salePersons.length === 0) {
      const error = new Error("Sale person not found!");
      error.statusCode = 404;
      throw error;
    }

    const finalDataToInsert = {
      ...data,
      user_id: user_id,
      sale_person: staff_id,
    };

    console.table(finalDataToInsert);

    await db("customers").insert(finalDataToInsert);
  } else {
    const error = new Error("You do not have permission to create customer");
    error.statusCode = 403;
    throw error;
  }
};

exports.getAllCustomer = async (user_id, staff_id, role) => {
  await userIdValidate(user_id);

  if (role === permission.admin) {
    return await db("customers")
      .select("*")
      .where({ user_id: user_id, is_deleted: false });
  }

  if (role === permission.sale_person) {
    if (!staff_id) {
      const error = new Error("Sale person ID is required!");
      error.statusCode = 400;
      throw error;
    }
    return await db("customers")
      .select("*")
      .where({ user_id: user_id, sale_person: staff_id, is_deleted: false });
  }

  const error = new Error("You can't view customer");
  error.statusCode = 403;
  throw error;
};

exports.getCustomerById = async (user_id, staff_id, id, role) => {
  await userIdValidate(user_id);

  if (role !== permission.admin && role !== permission.sale_person) {
    throw validateError("You no have permission", 403);
  }

  if (role === permission.admin) {
    const result = await db("customers")
      .select("*")
      .where({ user_id: user_id, is_deleted: false, id: id })
      .first();
    return result;
  }

  if (role === permission.sale_person) {
    const result = await db("customers")
      .select("*")
      .where({ user_id: user_id, sale_person: staff_id, id: id })
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
    .where({ user_id: user_id, permission_lvl: 3, status: "active" });

  if (!resultStaff) {
    throw validateError("Staff", 404);
  }

  if (permissinRole === permission.admin) {
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

  if (permissinRole !== permission.admin) {
    throw validateError("No permission", 403);
  }
};

exports.updateCustomer = async (
  user_id,
  staff_id,
  customer_id,
  permissinRole,
  data
) => {
  if (![permission.admin, permission.sale_person].includes(permissinRole)) {
    throw validateError(
      "No have permission",
      statusCodePermission.noHavePermission
    );
  }
  await userIdValidate(user_id);

  const checkStaffId = await db("staff").select("*").where({
    user_id,
    id: staff_id,
    permission_lvl: 3,
    status: "active",
  });

  if (checkStaffId.length === 0) {
    throw validateError("Staff ID", statusCodePermission.notFoundPermiision);
  }

  if (permissinRole === permission.admin) {
    const checkCustomerId = await db("customers").select("*").where({
      user_id,
      id: customer_id,
      is_deleted: false,
    });

    if (checkCustomerId.length === 0) {
      throw validateError(
        "Customer ID",
        statusCodePermission.notFoundPermiision
      );
    }
  } else if (permissinRole === permission.sale_person) {
    const checkCustomerId = await db("customers").select("*").where({
      user_id,
      sale_person: staff_id,
      id: customer_id,
      is_deleted: false,
    });

    if (checkCustomerId.length === 0) {
      throw validateError(
        "Customer ID",
        statusCodePermission.notFoundPermiision
      );
    }
  }

  const finalDataUpdate = {
    ...data,
    user_id,
    sale_person: staff_id,
  };

  if (permissinRole === permission.admin) {
    await db("customers")
      .select("*")
      .where({
        user_id,
        id: customer_id,
        is_deleted: false,
      })
      .update(finalDataUpdate);
  } else if (permissinRole === permission.sale_person) {
    await db("customers")
      .select("*")
      .where({
        user_id,
        sale_person: staff_id,
        id: customer_id,
        is_deleted: false,
      })
      .update(finalDataUpdate);
  }
};

exports.deleteCustomer = async (user_id, staff_id, customer_id, role) => {
  if (![permission.admin, permission.sale_person].includes(role)) {
    throw validateError(
      "No have permission",
      statusCodePermission.noHavePermission
    );
  }

  await userIdValidate(user_id);

  const checkStaff = await db("staff").select("*").where({
    user_id,
    id: staff_id,
    permission_lvl: 3,
    status: "active",
  });

  if (checkStaff.length === 0) {
    throw validateError(
      "Staff ID inactive or not found",
      statusCodePermission.notFoundPermiision
    );
  }

  let customerQuery = db("customers").select("*").where({
    user_id,
    id: customer_id,
    is_deleted: false,
  });

  if (role === permission.sale_person) {
    customerQuery.andWhere({ sale_person: staff_id });
  }

  const checkCustomer = await customerQuery;
  if (checkCustomer.length === 0) {
    throw validateError(
      "Customer ID not found",
      statusCodePermission.notFoundPermiision
    );
  }

  await db("customers")
    .update({ is_deleted: true })
    .where({ id: customer_id, user_id });
};
