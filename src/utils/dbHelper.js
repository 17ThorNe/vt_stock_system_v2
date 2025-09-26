const handleController = async (
  request,
  reply,
  serviceFunction,
  params = []
) => {
  try {
    const result = await serviceFunction(...params);

    let data = null;
    let pagination = undefined;

    if (Array.isArray(result) && typeof result[0] === "object") {
      data = result[0].data ?? result;
      pagination = result[0].pagination ?? undefined;
    } else {
      data = result;
    }

    reply.code(200).send({
      status: "success",
      data: data,
      pagination: pagination,
    });
  } catch (error) {
    reply.code(error.statusCode || 500).send({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

module.exports = { handleController };
