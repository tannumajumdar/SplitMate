import { z } from 'zod';

const CATEGORIES = ['food', 'rent', 'utilities', 'groceries', 'transport', 'entertainment', 'health', 'shopping', 'travel', 'other'] as const;
const SPLIT_TYPES = ['equal', 'percentage', 'exact'] as const;
const objectIdRegex = /^[a-f\d]{24}$/i;

const splitItemSchema = z.object({
  userId: z.string().regex(objectIdRegex, 'Invalid user ID'),
  amount: z.number().positive().optional(),
  percentage: z.number().min(0).max(100).optional(),
});

export const createExpenseSchema = z
  .object({
    title: z.string().trim().min(2, 'Title min 2 chars').max(200),
    amount: z.number().positive('Amount must be positive'),
    category: z.enum(CATEGORIES).default('other'),
    paidBy: z.string().regex(objectIdRegex, 'Invalid paidBy user ID'),
    groupId: z.string().regex(objectIdRegex, 'Invalid group ID'),
    splitType: z.enum(SPLIT_TYPES),
    splits: z.array(splitItemSchema).optional(),
    notes: z.string().trim().max(500).optional(),
    date: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.splitType !== 'equal' && (!data.splits || data.splits.length === 0)) {
        return false;
      }
      return true;
    },
    { message: 'splits required for non-equal split types', path: ['splits'] }
  );

export const updateExpenseSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  amount: z.number().positive().optional(),
  category: z.enum(CATEGORIES).optional(),
  notes: z.string().trim().max(500).optional().nullable(),
  date: z.coerce.date().optional(),
});

export const expenseFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.enum(CATEGORIES).optional(),
  paidBy: z.string().regex(objectIdRegex).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().trim().max(100).optional(),
});

export const expenseIdParamSchema = z.object({
  expenseId: z.string().regex(objectIdRegex, 'Invalid expense ID'),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>;
