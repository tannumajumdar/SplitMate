import { Document, Types } from 'mongoose';

export type SplitType = 'equal' | 'percentage' | 'exact';
export type ExpenseCategory =
  | 'food'
  | 'rent'
  | 'utilities'
  | 'groceries'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'travel'
  | 'other';

export interface IExpenseSplitItem {
  userId: Types.ObjectId;
  amount: number;
  percentage?: number;
  isSettled: boolean;
  settledAt?: Date;
}

export interface IExpense extends Document {
  _id: Types.ObjectId;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: Types.ObjectId;
  groupId: Types.ObjectId;
  splitType: SplitType;
  splits: IExpenseSplitItem[];
  receiptImage?: string;
  receiptImagePublicId?: string;
  notes?: string;
  date: Date;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseSplitInput {
  userId: string;
  amount?: number;
  percentage?: number;
}

export interface ICreateExpenseDTO {
  title: string;
  amount: number;
  category?: ExpenseCategory;
  paidBy: string;
  groupId: string;
  splitType: SplitType;
  splits?: IExpenseSplitInput[];
  notes?: string;
  date?: Date;
}

export interface IUpdateExpenseDTO {
  title?: string;
  amount?: number;
  category?: ExpenseCategory;
  notes?: string;
  date?: Date;
}

export interface IExpenseFilter {
  groupId?: string;
  category?: ExpenseCategory;
  paidBy?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}
