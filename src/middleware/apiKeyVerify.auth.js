const validateError = require("../utils/validateError");

const API_KEY = process.env.API_KEY;
const verifyApiKey = async (request, reply) => {
  const apiKey = request.headers["x-api-key"];

  if (!apiKey) {
    throw validateError("API KEY is missing", 403);
  }
  if (apiKey !== API_KEY) {
    throw validateError("Invalid API KEY", 403);
  }
};
module.exports = verifyApiKey;
