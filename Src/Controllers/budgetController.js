import Budget from '../Models/budget.js';
import Category from '../Models/category.js';
import ApiError from '../Utils/ApiError.js';
import ApiResponse from '../Utils/ApiResponse.js';
import { calculateSpending } from '../Services/budgetService.js';

// GET all budgets for the user (with live spending)
export const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({ user: userId, month, year }).populate(
      'category',
      'name icon color'
    );

    // Annotate each budget with real-time spent amount and percentage
    const annotated = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateSpending(
          userId,
          month,
          year,
          budget.budgetType === 'category' ? budget.category?._id : null
        );
        const percentage = parseFloat(((spent / budget.limitAmount) * 100).toFixed(2));
        const remaining = parseFloat((budget.limitAmount - spent).toFixed(2));
        return {
          ...budget.toObject(),
          spent: parseFloat(spent.toFixed(2)),
          remaining: remaining < 0 ? 0 : remaining,
          overBudget: spent > budget.limitAmount,
          percentage: Math.min(percentage, 100),
          actualPercentage: percentage,
        };
      })
    );

    res.status(200).json(new ApiResponse(200, annotated, 'Budgets retrieved.'));
  } catch (error) {
    next(error);
  }
};

// GET single budget
export const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'category',
      'name icon color'
    );
    if (!budget) return next(new ApiError(404, 'Budget not found.'));

    const spent = await calculateSpending(
      req.user._id,
      budget.month,
      budget.year,
      budget.budgetType === 'category' ? budget.category?._id : null
    );

    const percentage = parseFloat(((spent / budget.limitAmount) * 100).toFixed(2));

    res.status(200).json(
      new ApiResponse(
        200,
        {
          ...budget.toObject(),
          spent: parseFloat(spent.toFixed(2)),
          remaining: Math.max(0, parseFloat((budget.limitAmount - spent).toFixed(2))),
          overBudget: spent > budget.limitAmount,
          percentage: Math.min(percentage, 100),
          actualPercentage: percentage,
        },
        'Budget retrieved.'
      )
    );
  } catch (error) {
    next(error);
  }
};

// POST create budget
export const createBudget = async (req, res, next) => {
  try {
    const { budgetType, category, month, year, limitAmount } = req.body;

    if (budgetType === 'category') {
      const cat = await Category.findOne({
        _id: category,
        $or: [{ user: req.user._id }, { user: null }],
      });
      if (!cat) return next(new ApiError(404, 'Category not found.'));
    }

    const budget = await Budget.create({
      user: req.user._id,
      budgetType,
      category: budgetType === 'category' ? category : null,
      month,
      year,
      limitAmount,
    });

    res.status(201).json(new ApiResponse(201, budget, 'Budget created successfully.'));
  } catch (error) {
    next(error);
  }
};

// PUT update budget
export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) return next(new ApiError(404, 'Budget not found.'));

    const { limitAmount } = req.body;

    // When limit changes, reset alert flags so alerts can fire again at new thresholds
    if (limitAmount && limitAmount !== budget.limitAmount) {
      budget.alert80Sent = false;
      budget.alert100Sent = false;
    }

    if (limitAmount) budget.limitAmount = limitAmount;
    await budget.save();

    res.status(200).json(new ApiResponse(200, budget, 'Budget updated successfully.'));
  } catch (error) {
    next(error);
  }
};

// DELETE budget
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return next(new ApiError(404, 'Budget not found.'));

    res.status(200).json(new ApiResponse(200, null, 'Budget deleted successfully.'));
  } catch (error) {
    next(error);
  }
};
