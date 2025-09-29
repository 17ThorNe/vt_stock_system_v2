const db = require("../config/knex.js");
const bcrypt = require("bcrypt");
require("dotenv").config();
const SALT_ROUNDS = 10;

exports.createStaff = async (user_id, staffData) => {
  const {
    fullname,
    email,
    password,
    position,
    profile_img,
    permission_lvl,
    status,
  } = staffData;

  if (
    !fullname ||
    !email ||
    !password ||
    !position ||
    !permission_lvl ||
    !user_id
  ) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  const checkUserId = await db("users").where({ id: user_id }).first();
  if (!checkUserId) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const existingStaff = await db("staff").where({ email, user_id }).first();
  if (existingStaff) {
    const error = new Error("Staff email already exists");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const staffToInsert = {
    fullname,
    email,
    password: hashedPassword,
    position,
    profile_img: profile_img || null,
    permission_lvl,
    status: status || "active",
    user_id,
  };
  console.log("Inserting Staff:", staffToInsert);
  await db("staff").insert(staffToInsert);
};

exports.getAllStaff = async (user_id) => {
  const checkUserId = await db("users").where({ id: user_id }).first();
  if (!checkUserId) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const result = await db("staff")
    .where({ user_id })
    .andWhere({ status: "active" });
  if (result.length === 0) {
    const error = new Error("No staff found");
    error.statusCode = 200;
    throw error;
  }
  return result;
};

exports.getStaffById = async (id, user_id) => {
  const checkUserid = await db("users").where({ id: user_id }).first();
  if (!checkUserid) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const staff = await db("staff").where({ id, user_id }).first();
  if (!staff) {
    const error = new Error("Staff not found");
    error.statusCode = 404;
    throw error;
  }
  return staff;
};

exports.updateStaff = async (id, user_id, staffData) => {
  const checkUserid = await db("users").where({ id: user_id }).first();
  if (!checkUserid) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const staff = await db("staff").where({ id, user_id }).first();
  if (!staff) {
    const error = new Error("Staff not found");
    error.statusCode = 404;
    throw error;
  }

  const {
    fullname,
    email,
    password,
    position,
    profile_img,
    permission_lvl,
    status,
  } = staffData;

  if (!fullname || !email || !position || !permission_lvl) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  const existingStaff = await db("staff")
    .where({ email, user_id })
    .andWhereNot({ id })
    .first();
  if (existingStaff) {
    const error = new Error("Staff email already exists");
    error.statusCode = 400;
    throw error;
  }

  let updatedFields = {
    fullname,
    email,
    position,
    profile_img: profile_img || null,
    permission_lvl,
    status: status || "active",
  };

  if (password) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    updatedFields.password = hashedPassword;
  }

  await db("staff")
    .where({ id, user_id })
    .update({
      ...updatedFields,
      updated_at: new Date(),
    });
};

exports.deleteStaff = async (id, user_id) => {
  const checkUserId = await db("users").where({ id: user_id }).first();
  if (!checkUserId) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  const staff = await db("staff").where({ id, user_id }).first();
  if (!staff) {
    const error = new Error("Staff not found");
    error.statusCode = 404;
    throw error;
  }

  await db("staff").where({ id, user_id }).update({ status: "inactive" });
};
