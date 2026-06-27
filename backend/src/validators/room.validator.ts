import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().trim().min(2, 'Room name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional(),
});

export const addMemberSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().trim().min(10, 'Enter a valid phone number').max(15),
});

export const updateMemberSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(10).max(15).optional(),
  })
  .refine((d) => d.name !== undefined || d.phone !== undefined, {
    message: 'Provide at least name or phone to update',
  });

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
