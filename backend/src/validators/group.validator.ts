import { z } from 'zod';

const GROUP_CATEGORIES = ['roommates', 'flatmates', 'hostel', 'trip', 'couple', 'friends', 'other'] as const;

export const createGroupSchema = z.object({
  name: z.string().trim().min(2, 'Group name min 2 chars').max(100),
  description: z.string().trim().max(500).optional(),
  category: z.enum(GROUP_CATEGORIES).default('other'),
  currency: z.string().length(3, 'Currency must be 3 chars (e.g. INR)').default('INR'),
});

export const updateGroupSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  category: z.enum(GROUP_CATEGORIES).optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().trim().min(6).max(12).toUpperCase(),
});

export const groupIdParamSchema = z.object({
  groupId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid group ID'),
});

export const groupQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
