import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
} from '../Controllers/authController.js';
import authenticate from '../Middleware/authenticate.js';
import { authLimiter } from '../Middleware/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} from '../Validator/authValidator.js';

const router = Router();

// Public routes (rate-limited)
router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/refresh', refreshTokenValidator, refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
