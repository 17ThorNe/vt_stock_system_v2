const { data } = require("react-router-dom");
const db = require("../config/knex.js");

exports.getAllLevels = async () => {
  const result = await db("levels").where("is_visible", true);
  if (result.length === 0) {
    const error = new Error("Data is Empty");
    error.statusCode = 200;
    throw error;
  }
  return result;
};

exports.createLevels = async (dataLevels) => {
  const levelsArray = Array.isArray(dataLevels) ? dataLevels : [dataLevels];
  for (const level of levelsArray) {
    const existing = await db("levels")
      .where({ level_name: level.level_name })
      .first();
    if (existing) {
      const error = new Error(`Level name ${level.name} already exists!`);
      error.statusCode = 400;
      throw error;
    }
  }
  await db("levels").insert(levelsArray);
};

exports.getLevelById = async (id) => {
  const data = await db("levels")
    .where({ id })
    .andWhere("is_visible", true)
    .first();
  if (!data) {
    const error = new Error("Level ID not found!");
    error.statusCode = 404;
    throw error;
  }
  return data;
};

exports.updateLevel = async (id, dataLevel) => {
  const existing = await db("levels").where({ id, is_visible: true }).first();
  if (!existing) {
    const error = new Error("Level not found or already deleted!");
    error.statusCode = 404;
    throw error;
  }
  if (dataLevel.name && dataLevel.name !== existing.name) {
    const nameExists = await db("levels")
      .where({ name: dataLevel.name })
      .first();
    if (nameExists) {
      const error = new Error(`Level name ${dataLevel.name} already exists!`);
      error.statusCode = 400;
      throw error;
    }
  }
  await db("levels").where({ id }).update(dataLevel);
  return { status: "success" };
};

exports.deleteLevelById = async (id) => {
  const existing = await db("levels").where({ id, is_visible: true }).first();
  if (!existing) {
    const error = new Error("Level not found or already deleted!");
    error.statusCode = 404;
    throw error;
  }
  await db("levels").where({ id }).update({ is_visible: false });
  return { status: "success" };
};
