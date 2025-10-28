const db = require("../config/knex.js");

const userIdValidate = async (user_id) => {
  if (!user_id) {
    const error = new Error("User ID is missing or undefined!");
    error.statusCode = 400;
    throw error;
  }

  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
};

module.exports = userIdValidate;
