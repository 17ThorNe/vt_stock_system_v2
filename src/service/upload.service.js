const fs = require("fs");
const path = require("path");
const validateError = require("../utils/validateError");
const statusCodePermission = require("../utils/statusCodePermission");

exports.saveImage = async (file) => {
  if (!file) {
    throw validateError("No image", statusCodePermission.badRequestPermission);
  }

  const fileName = Date.now() + "-" + file.filename;
  const uploadPath = path.join(__dirname, "../uploads", fileName);

  // Save the file stream to disk
  const writeStream = fs.createWriteStream(uploadPath);
  await file.file.pipe(writeStream);

  return {
    fileName,
    filePath: `/uploads/${fileName}`,
  };
};
