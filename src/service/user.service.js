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

  // ------------------- ADMIN LOGIN -------------------
  const user = await db("users").where({ email }).first();
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // admin: user.id = user_id
    const token = jwt.sign(
      { id: user.id, user_id: user.id, role: "admin" },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return { token, user_id: user.id, role: "admin" };
  }

  // ------------------- STAFF LOGIN -------------------
  const staff = await db("staff").where({ email }).first();
  if (staff) {
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    let directionPermission;
    if (staff.permission_lvl === 1) {
      directionPermission = "inventory_manager";
    } else if (staff.permission_lvl === 2) {
      directionPermission = "sale_person";
    } else if (staff.permission_lvl === 3) {
      directionPermission = "finance";
    } else if (staff.permission_lvl === 4) {
      directionPermission = "delivery";
    }

    // staff.id = staff table id
    // staff.user_id = link to users table
    const token = jwt.sign(
      { sale_id: staff.id, user_id: staff.user_id, role: directionPermission },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return {
      token,
      sale_id: staff.id,
      user_id: staff.user_id,
      role: directionPermission,
    };
  }

  // ------------------- INVALID -------------------
  const error = new Error("Invalid email or password");
  error.statusCode = 401;
  throw error;
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
