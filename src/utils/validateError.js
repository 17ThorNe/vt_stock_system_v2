const validateError = (message, statusCode = 400) => {
  let errorMessage = message;

  switch (statusCode) {
    case 404:
      errorMessage = `${message} not found!`;
      break;
    case 403:
      errorMessage = `${message} - Forbidden!`;
      break;
    case 401:
      errorMessage = `${message} - !`;
      break;
    case 400:
      errorMessage = `${message} - Bad Request!`;
      break;
    default:
      errorMessage = message;
  }

  const error = new Error(errorMessage);
  error.statusCode = statusCode;
  return error;
};

module.exports = validateError;
