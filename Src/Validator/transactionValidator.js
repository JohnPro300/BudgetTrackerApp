import { body, query } from 'express-validator';
import { validate } from './authValidator.js';

// Create / Update Transaction
export const transactionValidator = [
  body('type')
    .notEmpty().withMessage('Transaction type is required.')
    .isIn(['income', 'expense']).withMessage("Type must be 'income' or 'expense'."),

  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),

  body('category')
    .notEmpty().withMessage('Category is required.')
    .isMongoId().withMessage('Category must be a valid ID.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters.'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date (e.g. 2025-01-15).'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array.'),

  body('tags.*')
    .optional()
    .isString().withMessage('Each tag must be a string.')
    .trim(),

  validate,
];

// Search / Filter Query Params
export const transactionFilterValidator = [
  query('type')
    .optional()
    .isIn(['income', 'expense']).withMessage("Type filter must be 'income' or 'expense'."),

  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate must be a valid ISO 8601 date.'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate must be a valid ISO 8601 date.'),

  query('minAmount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('minAmount must be a positive number.'),

  query('maxAmount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('maxAmount must be a positive number.'),

  query('category')
    .optional()
    .isMongoId().withMessage('category filter must be a valid ID.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),

  validate,
];
