import Transaction from '../Models/transaction.js';
import Budget from '../Models/budget.js';
import Category from '../Models/category.js';
import ApiResponse from '../Utils/ApiResponse.js';
import { calculateSpending } from '../Services/budgetService.js';
import { getPagination, buildPaginationMeta } from '../Utils/pagination.js';

// Helper: Build date range for a given month/year
const getMonthRange = (month, year) => ({
  startDate: new Date(year, month - 1, 1),
  endDate: new Date(year, month, 1),
});

// GET /api/reports/summary
// Income vs expense totals for a given period
export const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const { startDate, endDate } = getMonthRange(month, year);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    const income = result.find((r) => r._id === 'income') || { total: 0, count: 0, avgAmount: 0 };
    const expense = result.find((r) => r._id === 'expense') || { total: 0, count: 0, avgAmount: 0 };

    res.status(200).json(
      new ApiResponse(
        200,
        {
          period: { month, year },
          income: { total: income.total, count: income.count, average: parseFloat((income.avgAmount || 0).toFixed(2)) },
          expense: { total: expense.total, count: expense.count, average: parseFloat((expense.avgAmount || 0).toFixed(2)) },
          netBalance: parseFloat((income.total - expense.total).toFixed(2)),
          savingsRate: income.total > 0
            ? parseFloat((((income.total - expense.total) / income.total) * 100).toFixed(2))
            : 0,
        },
        'Summary report generated.'
      )
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/by-category:
// Spending breakdown grouped by category for a period
export const getByCategory = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const transactionType = req.query.type || 'expense';
    const { startDate, endDate } = getMonthRange(month, year);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: transactionType,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          transactions: { $push: { amount: '$amount', description: '$description', date: '$date' } },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Populate category details
    const categories = await Category.find({
      _id: { $in: breakdown.map((b) => b._id) },
    }).select('name icon color');

    const categoryMap = Object.fromEntries(categories.map((c) => [c._id.toString(), c]));

    const grandTotal = breakdown.reduce((sum, b) => sum + b.total, 0);

    const result = breakdown.map((b) => ({
      category: categoryMap[b._id?.toString()] || { name: 'Uncategorised', icon: '❓', color: '#888' },
      total: parseFloat(b.total.toFixed(2)),
      count: b.count,
      percentage: grandTotal > 0 ? parseFloat(((b.total / grandTotal) * 100).toFixed(2)) : 0,
    }));

    res.status(200).json(
      new ApiResponse(200, { period: { month, year }, type: transactionType, grandTotal: parseFloat(grandTotal.toFixed(2)), breakdown: result }, 'Category breakdown generated.')
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/budget-performance
// Budget vs actual spending for each budget in a period
export const getBudgetPerformance = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year }).populate(
      'category',
      'name icon color'
    );

    const performance = await Promise.all(
      budgets.map(async (b) => {
        const spent = await calculateSpending(
          req.user._id,
          month,
          year,
          b.budgetType === 'category' ? b.category?._id : null
        );
        const percentage = parseFloat(((spent / b.limitAmount) * 100).toFixed(2));
        return {
          budgetType: b.budgetType,
          category: b.category || null,
          limitAmount: b.limitAmount,
          spent: parseFloat(spent.toFixed(2)),
          remaining: parseFloat(Math.max(0, b.limitAmount - spent).toFixed(2)),
          overBy: spent > b.limitAmount ? parseFloat((spent - b.limitAmount).toFixed(2)) : 0,
          percentage,
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'on-track',
        };
      })
    );

    res.status(200).json(
      new ApiResponse(200, { period: { month, year }, performance }, 'Budget performance report generated.')
    );
  } catch (error) {
    next(error);
  }
};

//  GET /api/reports/history:
// Paginated list of past months with income/expense totals
export const getBudgetHistory = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, 12);

    const history = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          totals: {
            $push: { type: '$_id.type', total: '$total', count: '$count' },
          },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Count total distinct months for pagination
    const totalMonthsAgg = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } } } },
      { $count: 'total' },
    ]);
    const total = totalMonthsAgg[0]?.total || 0;

    const formatted = history.map(({ _id, totals }) => {
      const income = totals.find((t) => t.type === 'income') || { total: 0, count: 0 };
      const expense = totals.find((t) => t.type === 'expense') || { total: 0, count: 0 };
      return {
        year: _id.year,
        month: _id.month,
        monthName: new Date(_id.year, _id.month - 1).toLocaleString('default', { month: 'long' }),
        income: { total: parseFloat(income.total.toFixed(2)), count: income.count },
        expense: { total: parseFloat(expense.total.toFixed(2)), count: expense.count },
        netBalance: parseFloat((income.total - expense.total).toFixed(2)),
      };
    });

    res.status(200).json(
      new ApiResponse(200, { history: formatted, meta: buildPaginationMeta(total, page, limit) }, 'Budget history retrieved.')
    );
  } catch (error) {
    next(error);
  }
};
