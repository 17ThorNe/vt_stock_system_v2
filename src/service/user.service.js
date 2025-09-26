const db = require("../config/knex.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";
const SALT_ROUNDS = 10;

exports.getAllUsers = async () => {
  const result = await db("users").select("*");
  if (result.length === 0) {
    const error = new Error("Data is emtry");
    error.statusCode = 200;
    throw error;
  }
  return result;
};

exports.getUserByIdService = async (id) => {
  const result = await db("users").where({ id }).first();
  if (!result) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
  return result;
};

exports.createUser = async (user) => {
  if (
    !user.fullname ||
    !user.email ||
    !user.password ||
    !user.confirmPassword ||
    !user.level_id ||
    !user.status
  ) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await db("users").where({ email: user.email }).first();
  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
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
    store_name: user.store_name || null,
    profile: user.profile || null,
    level_id: user.level_id,
    status: user.status,
    is_visible: true,
  };

  return await db("users").insert(userToInsert);
};

exports.loginService = async (email, password) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await db("users").where({ email }).first();
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

  const { password: _, ...userWithoutPassword } = user;
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  });

  return { token, userId: user.id };
};
