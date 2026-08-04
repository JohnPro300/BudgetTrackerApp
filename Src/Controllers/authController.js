import User from '../Models/user.js';
import ApiError from '../Utils/ApiError.js';
import ApiResponse from '../Utils/ApiResponse.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../Services/authService.js';
import { sendWelcomeEmail } from '../Services/emailService.js';

// Register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, 'An account with this email already exists.'));
    }

    const user = await User.create({ name, email, password, role });

    // Send welcome email (non-blocking — failure should not break registration)
    try {
      await sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
    }

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    // Store hashed-equivalent refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json(
      new ApiResponse(
        201,
        {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          accessToken,
          refreshToken,
        },
        'Registration successful. Welcome!'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Select password explicitly (it is excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Your account has been deactivated. Contact support.'));
    }

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          accessToken,
          refreshToken,
        },
        'Login successful.'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return next(new ApiError(401, 'Invalid or expired refresh token. Please login again.'));
    }

    const newAccessToken = signAccessToken(user._id, user.role);
    const newRefreshToken = signRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed.')
    );
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(new ApiResponse(200, user, 'User profile retrieved.'));
  } catch (error) {
    next(error);
  }
};
