import ApiError from '../Utils/ApiError.js';

/**
 * authorize(...roles) — Role-Based Access Control middleware factory.
 * Usage: router.get('/admin-only', authenticate, authorize('admin'), handler)
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Required role(s): ${roles.join(', ')}.`)
      );
    }

    next();
  };
};

export default authorize;
