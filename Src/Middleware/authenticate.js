import { verifyAccessToken } from '../Services/authService.js';
import User from '../Models/user.js';
import ApiError from '../Utils/ApiError.js';

/**
 * authenticate middleware
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the full user object to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authentication required. Please provide a Bearer token.'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Fetch the user to ensure the account still exists and is active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'User not found or account has been deactivated.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
