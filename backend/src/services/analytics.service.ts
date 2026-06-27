import mongoose from 'mongoose';
import { Expense } from '../models/Expense.model';
import { groupRepository } from '../repositories/group.repository';
import { ApiError } from '../utils/ApiError';

export class AnalyticsService {
  async getGroupAnalytics(groupId: string, userId: string, year?: number, month?: number) {
    const isMember = await groupRepository.isMember(groupId, userId);
    if (!isMember) throw ApiError.forbidden('Not a group member');

    const gid = new mongoose.Types.ObjectId(groupId);
    const [monthlyTrend, categoryBreakdown, memberSpending, topExpenses] = await Promise.all([
      this.getMonthlyTrend(gid, year),
      this.getCategoryBreakdown(gid, year, month),
      this.getMemberSpending(gid, year, month),
      this.getTopExpenses(gid, year, month),
    ]);

    return { monthlyTrend, categoryBreakdown, memberSpending, topExpenses };
  }

  async getUserAnalytics(userId: string, year?: number, month?: number) {
    const uid = new mongoose.Types.ObjectId(userId);
    const [monthlyTrend, categoryBreakdown, groupBreakdown] = await Promise.all([
      this.getUserMonthlyTrend(uid, year),
      this.getUserCategoryBreakdown(uid, year, month),
      this.getUserGroupBreakdown(uid, year, month),
    ]);
    return { monthlyTrend, categoryBreakdown, groupBreakdown };
  }

  private async getMonthlyTrend(groupId: mongoose.Types.ObjectId, year?: number) {
    const matchYear = year ?? new Date().getFullYear();
    return Expense.aggregate([
      {
        $match: {
          groupId,
          isDeleted: false,
          date: {
            $gte: new Date(`${matchYear}-01-01`),
            $lte: new Date(`${matchYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
      { $project: { month: '$_id.month', total: 1, count: 1, _id: 0 } },
    ]);
  }

  private async getCategoryBreakdown(
    groupId: mongoose.Types.ObjectId,
    year?: number,
    month?: number
  ) {
    const dateFilter = this.buildDateFilter(year, month);
    return Expense.aggregate([
      { $match: { groupId, isDeleted: false, ...dateFilter } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { total: -1 } },
      { $project: { category: '$_id', total: 1, count: 1, avgAmount: 1, _id: 0 } },
    ]);
  }

  private async getMemberSpending(
    groupId: mongoose.Types.ObjectId,
    year?: number,
    month?: number
  ) {
    const dateFilter = this.buildDateFilter(year, month);
    return Expense.aggregate([
      { $match: { groupId, isDeleted: false, ...dateFilter } },
      { $group: { _id: '$paidBy', totalPaid: { $sum: '$amount' }, count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          totalPaid: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { totalPaid: -1 } },
    ]);
  }

  private async getTopExpenses(
    groupId: mongoose.Types.ObjectId,
    year?: number,
    month?: number
  ) {
    const dateFilter = this.buildDateFilter(year, month);
    return Expense.find({ groupId, isDeleted: false, ...dateFilter })
      .sort({ amount: -1 })
      .limit(5)
      .populate('paidBy', 'name')
      .select('title amount category paidBy date')
      .lean();
  }

  private async getUserMonthlyTrend(userId: mongoose.Types.ObjectId, year?: number) {
    const matchYear = year ?? new Date().getFullYear();
    return Expense.aggregate([
      {
        $match: {
          paidBy: userId,
          isDeleted: false,
          date: { $gte: new Date(`${matchYear}-01-01`), $lte: new Date(`${matchYear}-12-31`) },
        },
      },
      { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } },
      { $project: { month: '$_id.month', total: 1, count: 1, _id: 0 } },
    ]);
  }

  private async getUserCategoryBreakdown(
    userId: mongoose.Types.ObjectId,
    year?: number,
    month?: number
  ) {
    const dateFilter = this.buildDateFilter(year, month);
    return Expense.aggregate([
      { $match: { paidBy: userId, isDeleted: false, ...dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $project: { category: '$_id', total: 1, count: 1, _id: 0 } },
    ]);
  }

  private async getUserGroupBreakdown(
    userId: mongoose.Types.ObjectId,
    year?: number,
    month?: number
  ) {
    const dateFilter = this.buildDateFilter(year, month);
    return Expense.aggregate([
      { $match: { paidBy: userId, isDeleted: false, ...dateFilter } },
      { $group: { _id: '$groupId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'groups', localField: '_id', foreignField: '_id', as: 'group' } },
      { $unwind: '$group' },
      { $project: { groupId: '$_id', groupName: '$group.name', total: 1, count: 1, _id: 0 } },
      { $sort: { total: -1 } },
    ]);
  }

  private buildDateFilter(year?: number, month?: number): Record<string, unknown> {
    if (!year) return {};
    const from = month
      ? new Date(year, month - 1, 1)
      : new Date(`${year}-01-01`);
    const to = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(`${year}-12-31T23:59:59`);
    return { date: { $gte: from, $lte: to } };
  }
}

export const analyticsService = new AnalyticsService();
