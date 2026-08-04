import { body, query } from 'express-validator';
import { validate } from './authValidator.js';

// Create Budget 
export const createBudgetValidator = [
  body('budgetType')
    .notEmpty().withMessage('Budget type is required.')
    .isIn(['monthly', 'category']).withMessage("Budget type must be 'monthly' or 'category'."),

  body('category')
    .if(body('budgetType').equals('category'))
    .notEmpty().withMessage('Category ID is required for category budgets.')
    .isMongoId().withMessage('Category must be a valid ID.'),

  body('month')
    .notEmpty().withMessage('Month is required.')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12.'),

  body('year')
    .notEmpty().withMessage('Year is required.')
    .isInt({ min: 2000 }).withMessage('Year must be 2000 or later.'),

  body('limitAmount')
    .notEmpty().withMessage('Limit amount is required.')
    .isFloat({ gt: 0 }).withMessage('Limit amount must be a positive number.'),

  validate,
];

// Update Budget
export const updateBudgetValidator = [
  body('limitAmount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Limit amount must be a positive number.'),

  validate,
];

// Report query params
export const reportQueryValidator = [
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12.'),

  query('year')
    .optional()
    .isInt({ min: 2000 }).withMessage('Year must be 2000 or later.'),

  validate,
];
