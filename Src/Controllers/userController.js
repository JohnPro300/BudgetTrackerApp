import User from '../Models/user.js';
import Transaction from '../Models/transaction.js';
import Budget from '../Models/budget.js';
import ApiError from '../Utils/ApiError.js';
import ApiResponse from '../Utils/ApiResponse.js';
import { getPagination, buildPaginationMeta } from '../Utils/pagination.js';

// Admin: List all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search || '';

    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, { users, meta: buildPaginationMeta(total, page, limit) }, 'Users retrieved.')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found.'));

    res.status(200).json(new ApiResponse(200, user, 'User retrieved.'));
  } catch (error) {
    next(error);
  }
};

// Admin: Deactivate / activate user
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found.'));

    // Prevent admins from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return next(new ApiError(400, 'You cannot deactivate your own account.'));
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      new ApiResponse(200, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`)
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found.'));

    if (user._id.toString() === req.user._id.toString()) {
      return next(new ApiError(400, 'You cannot delete your own account.'));
    }

    // Cascade delete related data
    await Promise.all([
      Transaction.deleteMany({ user: user._id }),
      Budget.deleteMany({ user: user._id }),
    ]);

    await user.deleteOne();

    res.status(200).json(new ApiResponse(200, null, 'User and all associated data deleted.'));
  } catch (error) {
    next(error);
  }
};

// Admin: Promote user to admin 
export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return next(new ApiError(400, "Role must be 'user' or 'admin'."));
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return next(new ApiError(404, 'User not found.'));

    res.status(200).json(new ApiResponse(200, { id: user._id, role: user.role }, 'User role updated.'));
  } catch (error) {
    next(error);
  }
};
