import Transaction from '../Models/transaction.js';
import Budget from '../Models/budget.js';
import User from '../Models/user.js';
import Category from '../Models/category.js';
import { sendBudget80Alert, sendBudget100Alert } from './emailService.js';

/**
 * Calculates total expense spending for a user for a given month/year
 * optionally filtered to a specific category.
 *
 * @param {string}  userId
 * @param {number}  month
 * @param {number}  year
 * @param {string|null} categoryId
 * @returns {number} total spent amount
 */
export const calculateSpending = async (userId, month, year, categoryId = null) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1); // first day of next month

  const match = {
    user: userId,
    type: 'expense',
    date: { $gte: startDate, $lt: endDate },
  };
  if (categoryId) match.category = categoryId;

  const result = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

/**
 * After an expense transaction is saved/updated, checks all relevant budgets
 * for the user and sends alert emails if 80% or 100% thresholds are crossed.
 *
 * @param {string} userId
 * @param {string} categoryId
 * @param {Date}   transactionDate
 */
export const checkBudgetAlerts = async (userId, categoryId, transactionDate) => {
  const month = transactionDate.getMonth() + 1;
  const year = transactionDate.getFullYear();

  // Find all relevant budgets: overall monthly + the specific category budget
  const budgets = await Budget.find({
    user: userId,
    month,
    year,
    $or: [{ budgetType: 'monthly' }, { budgetType: 'category', category: categoryId }],
  });

  if (!budgets.length) return;

  const user = await User.findById(userId);
  if (!user) return;

  for (const budget of budgets) {
    const isCategoryBudget = budget.budgetType === 'category';
    const spent = await calculateSpending(
      userId,
      month,
      year,
      isCategoryBudget ? categoryId : null
    );

    const percentage = (spent / budget.limitAmount) * 100;
    let budgetLabel = 'Monthly';

    if (isCategoryBudget) {
      const cat = await Category.findById(categoryId);
      budgetLabel = cat ? `${cat.name} Category` : 'Category';
    }

    const budgetInfo = {
      limitAmount: budget.limitAmount,
      spent,
      budgetLabel,
      month,
      year,
    };

    // 100% alert (only send once):
    if (percentage >= 100 && !budget.alert100Sent) {
      try {
        await sendBudget100Alert(user, budgetInfo);
        budget.alert100Sent = true;
        await budget.save();
      } catch (emailErr) {
        console.error('Failed to send 100% budget alert email:', emailErr.message);
      }
    }
    // 80% alert (only send once, and not if 100% was already triggered)
    else if (percentage >= 80 && !budget.alert80Sent) {
      try {
        await sendBudget80Alert(user, budgetInfo);
        budget.alert80Sent = true;
        await budget.save();
      } catch (emailErr) {
        console.error('Failed to send 80% budget alert email:', emailErr.message);
      }
    }
  }
};
