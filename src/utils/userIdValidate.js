const db = require("../config/knex.js");

const userIdValidate = async (user_id) => {
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
};

module.exports = userIdValidate;
