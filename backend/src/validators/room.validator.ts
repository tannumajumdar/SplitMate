import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().trim().min(2, 'Room name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional(),
});

export const addMemberSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().max(15).optional(),
});

export const updateMemberSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().max(15).optional(),
  })
  .refine((d) => d.name !== undefined || d.phone !== undefined || d.email !== undefined, {
    message: 'Provide at least one field to update',
  });

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
