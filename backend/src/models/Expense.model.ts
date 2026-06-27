import mongoose, { Schema } from 'mongoose';
import { IExpense, SplitType, ExpenseCategory } from '../interfaces/expense.interface';

const ExpenseSplitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    isSettled: { type: Boolean, default: false },
    settledAt: { type: Date },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      enum: ['food', 'rent', 'utilities', 'groceries', 'transport', 'entertainment', 'health', 'shopping', 'travel', 'other'] as ExpenseCategory[],
      default: 'other',
    },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    splitType: {
      type: String,
      enum: ['equal', 'percentage', 'exact'] as SplitType[],
      required: true,
    },
    splits: { type: [ExpenseSplitSchema], required: true },
    receiptImage: { type: String },
    receiptImagePublicId: { type: String },
    notes: { type: String, trim: true, maxlength: 500 },
    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.receiptImagePublicId;
        return ret;
      },
    },
  }
);

ExpenseSchema.index({ groupId: 1, createdAt: -1 });
ExpenseSchema.index({ paidBy: 1 });
ExpenseSchema.index({ 'splits.userId': 1 });
ExpenseSchema.index({ isDeleted: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ title: 'text', notes: 'text' });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
