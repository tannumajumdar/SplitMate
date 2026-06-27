import { FilterQuery } from 'mongoose';
import { Expense } from '../models/Expense.model';
import { IExpense, ICreateExpenseDTO, IExpenseFilter } from '../interfaces/expense.interface';

export class ExpenseRepository {
  async findById(id: string): Promise<IExpense | null> {
    return Expense.findOne({ _id: id, isDeleted: false })
      .populate('paidBy', 'name phone profilePhoto')
      .populate('splits.userId', 'name phone profilePhoto')
      .exec();
  }

  async create(data: Omit<ICreateExpenseDTO, 'groupId' | 'paidBy'> & Record<string, unknown>): Promise<IExpense> {
    const expense = new Expense(data);
    return expense.save();
  }

  async update(id: string, data: Record<string, unknown>): Promise<IExpense | null> {
    return Expense.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async softDelete(id: string): Promise<void> {
    await Expense.findByIdAndUpdate(id, { isDeleted: true }).exec();
  }

  async findByGroup(
    groupId: string,
    filter: IExpenseFilter,
    skip: number,
    limit: number
  ): Promise<IExpense[]> {
    const query = this.buildFilter(groupId, filter);
    return Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('paidBy', 'name phone profilePhoto')
      .populate('splits.userId', 'name phone profilePhoto')
      .exec();
  }

  async countByGroup(groupId: string, filter: IExpenseFilter): Promise<number> {
    const query = this.buildFilter(groupId, filter);
    return Expense.countDocuments(query).exec();
  }

  async findAllByGroup(groupId: string): Promise<IExpense[]> {
    return Expense.find({ groupId, isDeleted: false }).exec();
  }

  async findUnsettledForUser(userId: string, groupId: string): Promise<IExpense[]> {
    return Expense.find({
      groupId,
      isDeleted: false,
      'splits.userId': userId,
      'splits.isSettled': false,
    }).exec();
  }

  async markSplitSettled(expenseId: string, userId: string): Promise<void> {
    await Expense.updateOne(
      { _id: expenseId, 'splits.userId': userId },
      { $set: { 'splits.$.isSettled': true, 'splits.$.settledAt': new Date() } }
    ).exec();
  }

  async getGroupStats(groupId: string): Promise<{ total: number; count: number }> {
    const result = await Expense.aggregate([
      { $match: { groupId: groupId as unknown, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    return result[0] ?? { total: 0, count: 0 };
  }

  private buildFilter(groupId: string, filter: IExpenseFilter): FilterQuery<IExpense> {
    const query: FilterQuery<IExpense> = { groupId, isDeleted: false };

    if (filter.category) query.category = filter.category;
    if (filter.paidBy) query.paidBy = filter.paidBy;
    if (filter.fromDate || filter.toDate) {
      query.date = {};
      if (filter.fromDate) query.date.$gte = filter.fromDate;
      if (filter.toDate) query.date.$lte = filter.toDate;
    }
    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    return query;
  }
}

export const expenseRepository = new ExpenseRepository();
