const db = require("../config/knex.js");

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
  return await db("users").insert(user);
};
