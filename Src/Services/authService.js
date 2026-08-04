import jwt from 'jsonwebtoken';
import ApiError from '../Utils/ApiError.js';

/**
 * Signs a short-lived access token containing user id and role.
 */
export const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/**
 * Signs a long-lived refresh token.
 */
export const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

/**
 * Verifies an access token and returns its decoded payload.
 * Throws ApiError 401 on any failure.
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired. Please refresh.');
    }
    throw new ApiError(401, 'Invalid access token.');
  }
};

/**
 * Verifies a refresh token and returns its decoded payload.
 * Throws ApiError 401 on any failure.
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Refresh token has expired. Please login again.');
    }
    throw new ApiError(401, 'Invalid refresh token.');
  }
};
