/**
 * Custom API Error class.
 * Extends the native Error to carry an HTTP status code
 * and a flag to distinguish operational errors from bugs.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404)
   * @param {string} message    - Human-readable error message
   * @param {Array}  errors     - Optional array of validation/field errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // distinguishes from unexpected bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
