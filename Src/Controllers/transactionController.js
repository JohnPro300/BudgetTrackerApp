import Transaction from '../Models/transaction.js';
import Category from '../Models/category.js';
import ApiError from '../Utils/ApiError.js';
import ApiResponse from '../Utils/ApiResponse.js';
import { getPagination, buildPaginationMeta } from '../Utils/pagination.js';
import { checkBudgetAlerts } from '../Services/budgetService.js';

/**
 * Build a Mongoose filter object from the request query parameters.
 * Supports: type, category, startDate, endDate, minAmount, maxAmount, search (description)
 */
const buildTransactionFilter = (query, userId, isAdmin = false) => {
  const filter = {};

  // Admins can view all; regular users only see their own
  if (!isAdmin) filter.user = userId;
  else if (query.userId) filter.user = query.userId;

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999); // include full end day
      filter.date.$lte = end;
    }
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = parseFloat(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = parseFloat(query.maxAmount);
  }

  if (query.search) {
    filter.description = { $regex: query.search, $options: 'i' };
  }

  return filter;
};

// GET all transactions (with search & filter)
export const getTransactions = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const isAdmin = req.user.role === 'admin';
    const filter = buildTransactionFilter(req.query, req.user._id, isAdmin);

    // Sort: default newest first; allow sort=amount or sort=date
    const sortField = ['amount', 'date', 'createdAt'].includes(req.query.sort)
      ? req.query.sort
      : 'date';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('category', 'name icon color type')
        .populate('user', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        { transactions, meta: buildPaginationMeta(total, page, limit) },
        'Transactions retrieved.'
      )
    );
  } catch (error) {
    next(error);
  }
};

// GET single transaction
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('category', 'name icon color type')
      .populate('user', 'name email');

    if (!transaction) return next(new ApiError(404, 'Transaction not found.'));

    // Regular users can only access their own transactions
    if (req.user.role !== 'admin' && transaction.user._id.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Access denied.'));
    }

    res.status(200).json(new ApiResponse(200, transaction, 'Transaction retrieved.'));
  } catch (error) {
    next(error);
  }
};

// POST create transaction
export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date, tags } = req.body;

    // Verify category belongs to user or is global
    const cat = await Category.findOne({
      _id: category,
      $or: [{ user: req.user._id }, { user: null }],
    });
    if (!cat) return next(new ApiError(404, 'Category not found or does not belong to you.'));

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      tags,
    });

    // Check budget alerts asynchronously for expense transactions
    if (type === 'expense') {
      checkBudgetAlerts(req.user._id, category, transaction.date).catch((err) =>
        console.error('Budget alert check failed:', err.message)
      );
    }

    const populated = await transaction.populate('category', 'name icon color type');

    res.status(201).json(new ApiResponse(201, populated, 'Transaction created successfully.'));
  } catch (error) {
    next(error);
  }
};

//  PUT update transaction
export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return next(new ApiError(404, 'Transaction not found.'));

    if (transaction.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Access denied.'));
    }

    const { type, amount, category, description, date, tags } = req.body;

    if (category) {
      const cat = await Category.findOne({
        _id: category,
        $or: [{ user: req.user._id }, { user: null }],
      });
      if (!cat) return next(new ApiError(404, 'Category not found or does not belong to you.'));
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { type, amount, category, description, date: date ? new Date(date) : undefined, tags },
      { new: true, runValidators: true }
    ).populate('category', 'name icon color type');

    // Re-check budget alerts if the transaction is (or became) an expense
    const finalType = type || transaction.type;
    if (finalType === 'expense') {
      const finalCategory = category || transaction.category.toString();
      const finalDate = date ? new Date(date) : transaction.date;
      checkBudgetAlerts(req.user._id, finalCategory, finalDate).catch((err) =>
        console.error('Budget alert check failed:', err.message)
      );
    }

    res.status(200).json(new ApiResponse(200, updated, 'Transaction updated successfully.'));
  } catch (error) {
    next(error);
  }
};

// DELETE transaction
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return next(new ApiError(404, 'Transaction not found.'));

    if (transaction.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Access denied.'));
    }

    await transaction.deleteOne();

    res.status(200).json(new ApiResponse(200, null, 'Transaction deleted successfully.'));
  } catch (error) {
    next(error);
  }
};
