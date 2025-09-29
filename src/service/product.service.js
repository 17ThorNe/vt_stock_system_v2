const db = require("../config/knex.js");

exports.getAllProduct = async (user_id) => {
  const user = await db("users").where({ id: user_id }).first();
  if (!user) {
    const error = new Error("User ID not found!");
    error.statusCode = 404;
    throw error;
  }
  const result = await db("products")
    .where({ user_id, is_deleted: false })
    .select("*");
  if (result.length === 0) {
    const error = new Error("No products found");
    error.statusCode = 404;
    throw error;
  }
  return result;
};
