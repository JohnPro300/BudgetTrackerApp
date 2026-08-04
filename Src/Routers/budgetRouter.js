import { Router } from 'express';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../Controllers/budgetController.js';
import authenticate from '../Middleware/authenticate.js';
import { createBudgetValidator, updateBudgetValidator } from '../Validator/budgetValidator.js';

const router = Router();

// All budget routes require authentication
router.use(authenticate);

router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.post('/', createBudgetValidator, createBudget);
router.put('/:id', updateBudgetValidator, updateBudget);
router.delete('/:id', deleteBudget);

export default router;
