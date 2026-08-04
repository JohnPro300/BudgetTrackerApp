import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../Controllers/categoryController.js';
import authenticate from '../Middleware/authenticate.js';
import { categoryValidator } from '../Validator/categoryValidator.js';

const router = Router();

// All category routes require authentication
router.use(authenticate);

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', categoryValidator, createCategory);
router.put('/:id', categoryValidator, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
