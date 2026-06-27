import { Request, Response } from 'express';
import { expenseService } from '../services/expense.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilterInput,
} from '../validators/expense.validator';

export const addExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.addExpense(req.userId!, req.body as CreateExpenseInput);
  ApiResponse.created(res, { expense }, 'Expense added');
});

export const getExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.getExpense(req.params.expenseId, req.userId!);
  ApiResponse.success(res, { expense });
});

export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.updateExpense(
    req.params.expenseId,
    req.userId!,
    req.body as UpdateExpenseInput
  );
  ApiResponse.success(res, { expense }, 'Expense updated');
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  await expenseService.deleteExpense(req.params.expenseId, req.userId!);
  ApiResponse.noContent(res);
});

export const getGroupExpenses = asyncHandler(async (req: Request, res: Response) => {
  const filter = req.query as unknown as ExpenseFilterInput;
  const result = await expenseService.getGroupExpenses(req.params.groupId, req.userId!, filter);
  ApiResponse.paginated(res, result.data, result.pagination);
});

export const uploadReceipt = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No receipt image provided');
  const expense = await expenseService.uploadReceipt(
    req.params.expenseId,
    req.userId!,
    req.file.buffer,
    req.file.mimetype
  );
  ApiResponse.success(res, { expense }, 'Receipt uploaded');
});
