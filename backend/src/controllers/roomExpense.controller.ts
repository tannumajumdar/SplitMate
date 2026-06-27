import { Request, Response } from 'express';
import { RoomExpense } from '../models/RoomExpense.model';
import { RoomModel } from '../models/Room.model';
import { RoomMemberModel } from '../models/RoomMember.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// Verify user has access to the room (is creator or a recognized member context)
async function verifyRoomAccess(roomId: string, userId: string): Promise<void> {
  const room = await RoomModel.findById(roomId).lean();
  if (!room) throw ApiError.notFound('Room not found');
  if (room.createdBy.toString() !== userId) throw ApiError.forbidden('Access denied');
}

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  await verifyRoomAccess(req.params.roomId, req.userId!);

  const expenses = await RoomExpense.find({
    roomId: req.params.roomId,
    isDeleted: false,
  }).sort({ date: -1, createdAt: -1 }).lean();

  ApiResponse.success(res, { expenses });
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  await verifyRoomAccess(req.params.roomId, req.userId!);

  const { title, amount, category, paidBy, splitMethod, splits, notes, date } = req.body as {
    title: string;
    amount: number;
    category: string;
    paidBy: string;
    splitMethod: string;
    splits: Array<{ memberId: string; memberName: string; amount: number; percentage?: number; isPaid: boolean }>;
    notes?: string;
    date?: string;
  };

  // Verify paidBy member belongs to this room
  const paidByMember = await RoomMemberModel.findOne({ _id: paidBy, roomId: req.params.roomId }).lean();
  if (!paidByMember) throw ApiError.badRequest('paidBy member not found in this room');

  const expense = await RoomExpense.create({
    title: title.trim(),
    amount,
    category: category ?? 'other',
    paidBy,
    paidByName: paidByMember.name,
    roomId: req.params.roomId,
    splitMethod,
    splits: splits.map((s) => ({
      memberId: s.memberId,
      memberName: s.memberName,
      amount: s.amount,
      percentage: s.percentage,
      isPaid: s.isPaid ?? false,
    })),
    notes: notes?.trim() || undefined,
    date: date ? new Date(date) : new Date(),
    createdBy: req.userId,
  });

  ApiResponse.created(res, { expense }, 'Expense added');
});

export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  await verifyRoomAccess(req.params.roomId, req.userId!);

  const expense = await RoomExpense.findOne({
    _id: req.params.expenseId,
    roomId: req.params.roomId,
    isDeleted: false,
  });
  if (!expense) throw ApiError.notFound('Expense not found');
  if (expense.createdBy.toString() !== req.userId) throw ApiError.forbidden('Only the creator can update this expense');

  const { title, amount, category, notes, date, splits, splitMethod } = req.body as {
    title?: string;
    amount?: number;
    category?: string;
    notes?: string | null;
    date?: string;
    splits?: Array<{ memberId: string; memberName: string; amount: number; percentage?: number; isPaid: boolean }>;
    splitMethod?: string;
  };

  if (title !== undefined) expense.title = title.trim();
  if (amount !== undefined) expense.amount = amount;
  if (category !== undefined) expense.category = category;
  if (notes !== undefined) expense.notes = notes ?? undefined;
  if (date !== undefined) expense.date = new Date(date);
  if (splitMethod !== undefined) expense.splitMethod = splitMethod;
  if (splits !== undefined) {
    expense.splits = splits.map((s) => ({
      memberId: s.memberId as unknown as import('mongoose').Types.ObjectId,
      memberName: s.memberName,
      amount: s.amount,
      percentage: s.percentage,
      isPaid: s.isPaid ?? false,
    }));
  }

  await expense.save();
  ApiResponse.success(res, { expense }, 'Expense updated');
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  await verifyRoomAccess(req.params.roomId, req.userId!);

  const expense = await RoomExpense.findOne({
    _id: req.params.expenseId,
    roomId: req.params.roomId,
    isDeleted: false,
  });
  if (!expense) throw ApiError.notFound('Expense not found');
  if (expense.createdBy.toString() !== req.userId) throw ApiError.forbidden('Only the creator can delete this expense');

  expense.isDeleted = true;
  await expense.save();

  ApiResponse.noContent(res);
});
