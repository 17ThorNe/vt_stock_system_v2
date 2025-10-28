const db = require("../config/knex.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

exports.getAllUsers = async () => {
  const result = await db("users").select("*");
  if (result.length === 0) {
    const error = new Error("Data is empty");
    error.statusCode = 200;
    throw error;
  }
  return result;
};

exports.getUserByIdService = async (id) => {
  const user = await db("users").where({ id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
  const staff = await db("staff")
    .where({ user_id: id })
    .select("id", "fullname", "email", "position", "permission_lvl", "status");
  user.staff = staff || [];
  return user;
};

exports.createUser = async (user) => {
  if (
    !user.fullname ||
    !user.email ||
    !user.password ||
    !user.confirmPassword
  ) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await db("users").where({ email: user.email }).first();
  if (existingUser) {
    if (existingUser.status === "inactive") {
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

      await db("users").where({ id: existingUser.id }).update({
        fullname: user.fullname,
        password: hashedPassword,
        updated_at: new Date(),
      });

      return;
    } else {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }
  }

  if (user.password !== user.confirmPassword) {
    const error = new Error("Passwords do not match");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

  const userToInsert = {
    fullname: user.fullname,
    email: user.email,
    password: hashedPassword,
  };

  await db("users").insert(userToInsert);
};

exports.loginService = async (email, password) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const staff = await db("staff").where({ email }).first();
  if (staff) {
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const map = {
      1: "admin",
      2: "inventory_manager",
      3: "sale_person",
      4: "finance",
      5: "delivery",
    };
    const role = map[staff.permission_lvl] || "staff";

    const payload = {
      user_id: staff.user_id,
      staff_id: staff.id,
      role,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    return { payload, token };
  }

  const user = await db("users").where({ email }).first();
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const payload = { user_id: user.id, role: "super_admin" };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    return { payload, token };
  }

  throw new Error("Invalid email or password");
};

exports.inActiveAccount = async (id, currentUserLevel) => {
  const user = await db("users").where({ id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }

  if (currentUserLevel !== 1) {
    const error = new Error("Insufficient permissions to inactivate account");
    error.statusCode = 403;
    throw error;
  }

  await db("users").where({ id }).update({ status: "inactive" });
};

exports.getCurrentUser = async ({ user_id, staff_id }) => {
  if (staff_id) {
    const staff = await db("staff").where({ id: staff_id }).first();
    if (!staff) throw new Error("Staff not found");

    let role;
    switch (staff.permission_lvl) {
      case 1:
        role = "admin";
        break;
      case 2:
        role = "inventory_manager";
        break;
      case 3:
        role = "sale_person";
        break;
      case 4:
        role = "finance";
        break;
      case 5:
        role = "delivery";
        break;
      default:
        role = "staff";
    }

    return {
      user_id: staff.user_id,
      staff_id: staff.id,
      role,
    };
  }

  if (user_id) {
    const user = await db("users").where({ id: user_id }).first();
    if (!user) throw new Error("User not found");

    return { user_id: user.id, role: "super_admin" };
  }

  throw new Error("User not found");
};
