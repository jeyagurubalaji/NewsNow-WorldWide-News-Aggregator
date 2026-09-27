/** Carries an HTTP status alongside the message, so errorHandler.js can build
 *  the same {timestamp, status, message, path} shape as the old ApiError.java DTO. */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = ApiError;
