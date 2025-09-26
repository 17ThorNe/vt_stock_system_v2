const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

async function JWTAuth(request, reply) {
  try {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      return reply.code(401).send({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return reply.code(401).send({ error: "Token missing" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    request.user = decoded;
  } catch (err) {
    return reply.code(403).send({ error: "Invalid or expired token" });
  }
}

module.exports = { JWTAuth };
