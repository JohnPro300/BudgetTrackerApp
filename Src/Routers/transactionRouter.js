import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../Controllers/transactionController.js';
import authenticate from '../Middleware/authenticate.js';
import {
  transactionValidator,
  transactionFilterValidator,
} from '../Validator/transactionValidator.js';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

router.get('/', transactionFilterValidator, getTransactions);
router.get('/:id', getTransactionById);
router.post('/', transactionValidator, createTransaction);
router.put('/:id', transactionValidator, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
