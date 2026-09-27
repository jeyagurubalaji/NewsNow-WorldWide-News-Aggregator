const ApiError = require('../utils/ApiError');

/**
 * Central error handler — produces the same {timestamp, status, message, path}
 * shape as GlobalExceptionHandler.java's ApiError DTO, so the frontend's
 * `err.response?.data?.message` reads keep working unchanged.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = 500;
  let message = `Something went wrong: ${err.message}`;

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation errors -> 400, mirrors MethodArgumentNotValidException handling
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('; ');
  } else if (err.code === 11000) {
    // Mongo duplicate key -> 409, mirrors DuplicateResourceException handling
    status = 409;
    message = 'A record with that value already exists';
  }

  res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    message,
    path: req.originalUrl,
  });
}

module.exports = { errorHandler };
