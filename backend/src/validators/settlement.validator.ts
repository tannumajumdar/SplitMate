import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;
const PAYMENT_METHODS = ['upi', 'cash', 'bank_transfer', 'other'] as const;

export const createSettlementSchema = z.object({
  groupId: z.string().regex(objectIdRegex, 'Invalid group ID'),
  receiverId: z.string().regex(objectIdRegex, 'Invalid receiver ID'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(PAYMENT_METHODS).default('cash'),
  note: z.string().trim().max(300).optional(),
  transactionId: z.string().trim().max(100).optional(),
});

export const settlementFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  groupId: z.string().regex(objectIdRegex).optional(),
});

export const settlementIdParamSchema = z.object({
  settlementId: z.string().regex(objectIdRegex, 'Invalid settlement ID'),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
