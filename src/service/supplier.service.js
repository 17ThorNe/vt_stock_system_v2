const db = require("../config/knex.js");
const permission = require("../utils/permission.js");
const printf = require("../utils/printf.utils.js");
const userIdValidate = require("../utils/userIdValidate.js");
const validateError = require("../utils/validateError.js");

exports.createSupplier = async (user_id, staff_id, role, data) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  let isStaff = db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 2, status: "active" });

  if (role === permission.inventory) {
    isStaff.andWhere({ id: staff_id });
  }

  const resultStaff = await isStaff;
  if (resultStaff.length === 0) {
    throw validateError("Staff ID", 404);
  }

  const finalInsertData = {
    ...data,
    user_id,
    inventory_mn_id: staff_id,
  };

  await db("supplier").insert(finalInsertData);
};

exports.getAllSupplier = async (user_id, role) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No have permission", 403);
  }
  await userIdValidate(user_id);
  const result = await db("supplier")
    .select("*")
    .where({ user_id, status: "active" });

  if (result.length === 0) {
    throw validateError("Supplier not found!", 404);
  }

  return result;
};

exports.getSupplierById = async (user_id, id, role) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  const isSupplierId = await db("supplier")
    .select("*")
    .where({ user_id, id, status: "active" })
    .first();

  if (!isSupplierId) {
    throw validateError("Supplier ID", 404);
  }

  return isSupplierId;
};

exports.updateSupplier = async (user_id, id, staff_id, role, data) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No have permission", 403);
  }

  await userIdValidate(user_id);

  const isStaff = await db("staff")
    .select("*")
    .where({ user_id, permission_lvl: 2, id: staff_id, status: "active" })
    .first();

  if (!isStaff) {
    throw validateError("Staff ID", 404);
  }

  const isSupplierId = await db("supplier")
    .select("*")
    .where({ user_id, status: "active", id })
    .first();

  if (!isSupplierId) {
    throw validateError("Supplier ID", 404);
  }

  const finalDataUpdate = {
    ...data,
    user_id,
    inventory_mn_id: staff_id,
  };
  await db("supplier").update(finalDataUpdate);
};

exports.deleteSupplier = async (user_id, id, role) => {
  if (![permission.admin, permission.inventory].includes(role)) {
    throw validateError("No have permission", 404);
  }

  await userIdValidate(user_id);

  const isSupplierId = await db("supplier")
    .select("*")
    .where({ user_id, id, status: "active" })
    .first();

  if (!isSupplierId) {
    throw validateError("Supplier ID", 404);
  }

  await db("supplier")
    .update({ status: "inactive" })
    .where({ user_id, id, status: "active" });
};
