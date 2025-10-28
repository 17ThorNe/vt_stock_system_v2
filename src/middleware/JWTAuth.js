const jwt = require("jsonwebtoken");
const validateError = require("../utils/validateError");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;

async function JWTAuth(request, reply) {
  const token = request.cookies.token;
  if (!token)
    return reply.status(401).send({ status: "error", message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    request.user = decoded;
  } catch {
    return reply
      .status(403)
      .send({ status: "error", message: "Invalid or expired token" });
  }
}

module.exports = { JWTAuth };
