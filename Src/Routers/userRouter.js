import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  changeUserRole,
} from '../Controllers/userController.js';
import authenticate from '../Middleware/authenticate.js';
import authorize from '../Middleware/authorize.js';

const router = Router();

// All user management routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', toggleUserStatus);
router.patch('/:id/role', changeUserRole);
router.delete('/:id', deleteUser);

export default router;
