import Category from '../Models/category.js';
import Transaction from '../Models/transaction.js';
import ApiError from '../Utils/ApiError.js';
import ApiResponse from '../Utils/ApiResponse.js';

// GET all categories visible to the user
// Returns: global (admin-created) categories + the user's own custom categories
export const getCategories = async (req, res, next) => {
  try {
    const filter = {
      $or: [{ user: null }, { user: req.user._id }],
    };

    // Optional filter by type
    if (req.query.type) filter.type = { $in: [req.query.type, 'both'] };

    const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });
    res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved.'));
  } catch (error) {
    next(error);
  }
};

// GET single category
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      $or: [{ user: null }, { user: req.user._id }],
    });
    if (!category) return next(new ApiError(404, 'Category not found.'));

    res.status(200).json(new ApiResponse(200, category, 'Category retrieved.'));
  } catch (error) {
    next(error);
  }
};

// POST create category
export const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    // Global categories can only be created by admins
    const categoryUser = req.user.role === 'admin' && req.body.isGlobal ? null : req.user._id;

    const category = await Category.create({
      name,
      type: type || 'both',
      icon,
      color,
      user: categoryUser,
      isDefault: req.user.role === 'admin' && req.body.isGlobal ? true : false,
    });

    res.status(201).json(new ApiResponse(201, category, 'Category created successfully.'));
  } catch (error) {
    next(error);
  }
};

// PUT update category
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, 'Category not found.'));

    // Global categories can only be edited by admins; user categories only by the owner
    const isOwner = category.user && category.user.toString() === req.user._id.toString();
    const isAdminEditingGlobal = !category.user && req.user.role === 'admin';

    if (!isOwner && !isAdminEditingGlobal) {
      return next(new ApiError(403, 'You do not have permission to edit this category.'));
    }

    const { name, type, icon, color } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, type, icon, color },
      { new: true, runValidators: true }
    );

    res.status(200).json(new ApiResponse(200, updated, 'Category updated successfully.'));
  } catch (error) {
    next(error);
  }
};

// DELETE category
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, 'Category not found.'));

    const isOwner = category.user && category.user.toString() === req.user._id.toString();
    const isAdminEditingGlobal = !category.user && req.user.role === 'admin';

    if (!isOwner && !isAdminEditingGlobal) {
      return next(new ApiError(403, 'You do not have permission to delete this category.'));
    }

    // Prevent deletion if category is in use
    const txCount = await Transaction.countDocuments({ category: category._id });
    if (txCount > 0) {
      return next(
        new ApiError(400, `Cannot delete: this category is used by ${txCount} transaction(s). Reassign them first.`)
      );
    }

    await category.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully.'));
  } catch (error) {
    next(error);
  }
};
