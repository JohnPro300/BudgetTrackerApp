import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Scope:
    // 'monthly': overall spending cap for the month
    // 'category': spending cap per category for the month
    budgetType: {
      type: String,
      enum: ['monthly', 'category'],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // only set when budgetType === 'category'
    },
    // Period 
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
    },
    // Limits
    limitAmount: {
      type: Number,
      required: [true, 'Budget limit amount is required'],
      min: [0.01, 'Budget limit must be greater than 0'],
    },
    // Alert tracking
    alert80Sent: { type: Boolean, default: false },
    alert100Sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Each user can have only one budget entry per type+category+month+year
budgetSchema.index(
  { user: 1, budgetType: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
export default Budget;