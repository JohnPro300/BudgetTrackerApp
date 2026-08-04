import { Router } from 'express';
import {
  getSummary,
  getByCategory,
  getBudgetPerformance,
  getBudgetHistory,
} from '../Controllers/reportController.js';
import authenticate from '../Middleware/authenticate.js';
import { reportQueryValidator } from '../Validator/budgetValidator.js';

const router = Router();

// All report routes require authentication
router.use(authenticate);

router.get('/summary', reportQueryValidator, getSummary);
router.get('/by-category', reportQueryValidator, getByCategory);
router.get('/budget-performance', reportQueryValidator, getBudgetPerformance);
router.get('/history', getBudgetHistory);

export default router;
