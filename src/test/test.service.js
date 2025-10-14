const db = require("../config/knex.js");

exports.getTest = async (user_id, inventory_id) => {
  const result = await db("orders")
    .select("*")
    .where({ inventory_manager_id: inventory_id });
  return result;
};
