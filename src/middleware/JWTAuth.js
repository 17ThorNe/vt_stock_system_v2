const jwt = require("jsonwebtoken");
const validateError = require("../utils/validateError");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;

async function JWTAuth(request, reply) {
  try {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      throw validateError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw validateError("Token missing", 401);
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    request.user = decoded;
  } catch (err) {
    throw validateError("Invalid or expired token", 403);
  }
}

module.exports = { JWTAuth };
