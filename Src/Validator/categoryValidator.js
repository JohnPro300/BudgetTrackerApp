import { body } from 'express-validator';
import { validate } from './authValidator.js';

// Create / Update Category
export const categoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ max: 50 }).withMessage('Category name cannot exceed 50 characters.'),

  body('type')
    .optional()
    .isIn(['income', 'expense', 'both']).withMessage("Type must be 'income', 'expense', or 'both'."),

  body('icon')
    .optional()
    .isString().withMessage('Icon must be a string (emoji or icon name).')
    .trim(),

  body('color')
    .optional()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).withMessage('Color must be a valid hex color (e.g. #fff or #ffffff).'),

  validate,
];
