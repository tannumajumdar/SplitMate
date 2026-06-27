import mongoose from 'mongoose';
import { expenseRepository } from '../repositories/expense.repository';
import { groupRepository } from '../repositories/group.repository';
import { IExpense, ICreateExpenseDTO, IUpdateExpenseDTO, IExpenseFilter } from '../interfaces/expense.interface';
import { ApiError } from '../utils/ApiError';
import { calculateSplits } from '../utils/balanceCalculator';
import { getPaginationOptions, buildPaginationMeta, getSkip } from '../utils/pagination';
import { PaginatedResult } from '../types/common.types';
import { notificationService } from './notification.service';
import { cloudinary } from '../config/cloudinary';

export class ExpenseService {
  async addExpense(userId: string, data: ICreateExpenseDTO): Promise<IExpense> {
    const group = await groupRepository.findById(data.groupId);
    if (!group || group.status !== 'active') throw ApiError.notFound('Group not found');

    const isMember = await groupRepository.isMember(data.groupId, userId);
    if (!isMember) throw ApiError.forbidden('Not a group member');

    const activeMemberIds = group.members
      .filter((m) => m.isActive)
      .map((m) => m.userId.toString());

    // Validate paidBy is a group member
    if (!activeMemberIds.includes(data.paidBy))
      throw ApiError.badRequest('paidBy user is not a group member');

    // Calculate splits
    const computedSplits = calculateSplits(
      data.amount,
      activeMemberIds,
      data.splitType,
      data.splits
    );

    const expense = await expenseRepository.create({
      title: data.title,
      amount: data.amount,
      category: data.category ?? 'other',
      paidBy: new mongoose.Types.ObjectId(data.paidBy),
      groupId: new mongoose.Types.ObjectId(data.groupId),
      splitType: data.splitType,
      splits: computedSplits.map((s) => ({
        userId: s.userId,
        amount: s.amount,
        percentage: s.percentage,
        isSettled: s.userId === data.paidBy, // payer's own share is auto-settled
      })),
      notes: data.notes,
      date: data.date ?? new Date(),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await groupRepository.incrementTotalExpenses(data.groupId, data.amount);

    // Notify members (excluding creator)
    await notificationService.notifyGroupMembers(
      data.groupId,
      userId,
      'expense_added',
      'New expense added',
      `${data.title} – ₹${data.amount.toFixed(2)} added`
    );

    return expense;
  }

  async getExpense(expenseId: string, userId: string): Promise<IExpense> {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) throw ApiError.notFound('Expense not found');

    const isMember = await groupRepository.isMember(expense.groupId.toString(), userId);
    if (!isMember) throw ApiError.forbidden('Access denied');

    return expense;
  }

  async updateExpense(
    expenseId: string,
    userId: string,
    data: IUpdateExpenseDTO
  ): Promise<IExpense> {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) throw ApiError.notFound('Expense not found');

    if (expense.createdBy.toString() !== userId)
      throw ApiError.forbidden('Only the creator can update this expense');

    const updated = await expenseRepository.update(expenseId, data as Record<string, unknown>);
    if (!updated) throw ApiError.internal();

    return updated;
  }

  async deleteExpense(expenseId: string, userId: string): Promise<void> {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) throw ApiError.notFound('Expense not found');

    const isCreator = expense.createdBy.toString() === userId;
    const isAdmin = await groupRepository.isAdmin(expense.groupId.toString(), userId);

    if (!isCreator && !isAdmin)
      throw ApiError.forbidden('Only the creator or group admin can delete this expense');

    await expenseRepository.softDelete(expenseId);
    await groupRepository.incrementTotalExpenses(expense.groupId.toString(), -expense.amount);
  }

  async getGroupExpenses(
    groupId: string,
    userId: string,
    filter: IExpenseFilter
  ): Promise<PaginatedResult<IExpense>> {
    const isMember = await groupRepository.isMember(groupId, userId);
    if (!isMember) throw ApiError.forbidden('Not a group member');

    const { page, limit } = getPaginationOptions(
      filter.page?.toString(),
      filter.limit?.toString()
    );
    const skip = getSkip(page, limit);

    const [expenses, total] = await Promise.all([
      expenseRepository.findByGroup(groupId, filter, skip, limit),
      expenseRepository.countByGroup(groupId, filter),
    ]);

    return { data: expenses, pagination: buildPaginationMeta(total, page, limit) };
  }

  async uploadReceipt(
    expenseId: string,
    userId: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<IExpense> {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) throw ApiError.notFound('Expense not found');
    if (expense.createdBy.toString() !== userId) throw ApiError.forbidden('Access denied');

    if (expense.receiptImagePublicId) {
      await cloudinary.uploader.destroy(expense.receiptImagePublicId);
    }

    const base64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'splitmate/receipts',
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    const updated = await expenseRepository.update(expenseId, {
      receiptImage: result.secure_url,
      receiptImagePublicId: result.public_id,
    });

    if (!updated) throw ApiError.internal();
    return updated;
  }
}

export const expenseService = new ExpenseService();
