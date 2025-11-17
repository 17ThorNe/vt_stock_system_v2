const userService = require("../service/user.service.js");
const { handleController } = require("../utils/dbHelper.js");

exports.getUser = async (request, reply) => {
  console.log("Request User:", request.user.id);
  await handleController(request, reply, userService.getAllUsers);
};

exports.getUserById = async (request, reply) => {
  const id = request.params.id;
  await handleController(request, reply, userService.getUserByIdService, [id]);
};

exports.createUser = async (request, reply) => {
  const user = request.body;
  await handleController(request, reply, userService.createUser, [user]);
};

exports.login = async (request, reply) => {
  const { email, password } = request.body;

  try {
    const { payload, token } = await userService.loginService(email, password);

    reply
      .setCookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
        maxAge: 3600,
      })
      .send({
        status: "success",
        data: payload,
      });
  } catch (err) {
    reply
      .status(err.statusCode || 500)
      .send({ status: "error", message: err.message });
  }
};

exports.inactiveAccount = async (request, reply) => {
  const id = request.params.id;
  const currentUserLevel = request.user.level_id;
  await handleController(request, reply, userService.inActiveAccount, [
    id,
    currentUserLevel,
  ]);
};

exports.getMe = async (request, reply) => {
  try {
    const { user_id, staff_id } = request.user;
    const data = await userService.getCurrentUser({ user_id, staff_id });

    return reply.send({ status: "success", data });
  } catch (err) {
    return reply.status(404).send({ status: "error", message: err.message });
  }
};

exports.logoutController = async (request, reply) => {
  try {
    reply.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return reply.send({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    return reply.status(500).send({
      status: "error",
      message: "Failed to logout",
    });
  }
};
