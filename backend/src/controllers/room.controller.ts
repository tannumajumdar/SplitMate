import { Request, Response } from 'express';
import { RoomModel } from '../models/Room.model';
import { RoomMemberModel } from '../models/RoomMember.model';
import { User } from '../models/User.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import type { CreateRoomInput, AddMemberInput, UpdateMemberInput } from '../validators/room.validator';

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function uniqueInviteCode(): Promise<string> {
  let code: string;
  let attempts = 0;
  do {
    code = generateInviteCode();
    attempts++;
  } while ((await RoomModel.exists({ inviteCode: code })) && attempts < 10);
  return code;
}

// POST /rooms
export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body as CreateRoomInput;

  const creator = await User.findById(req.userId).select('name email').lean();
  if (!creator) throw ApiError.notFound('User not found');

  const inviteCode = await uniqueInviteCode();
  const room = await RoomModel.create({ name, description, createdBy: req.userId, inviteCode });

  await RoomMemberModel.create({
    roomId: room._id,
    userId: req.userId,
    name: creator.name,
    email: creator.email ?? '',
    phone: '',
    addedBy: req.userId,
  });

  ApiResponse.created(res, { room }, 'Room created');
});

// GET /rooms — returns rooms the user created OR joined via invite
export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const memberRecords = await RoomMemberModel.find({ userId: req.userId }).select('roomId').lean();
  const joinedRoomIds = memberRecords.map((m) => m.roomId);

  const rooms = await RoomModel.find({
    $or: [{ createdBy: req.userId }, { _id: { $in: joinedRoomIds } }],
  }).sort({ createdAt: -1 }).lean();

  ApiResponse.success(res, { rooms });
});

// GET /rooms/:roomId
export const getRoom = asyncHandler(async (req: Request, res: Response) => {
  const memberRecord = await RoomMemberModel.findOne({ roomId: req.params.roomId, userId: req.userId });
  const room = await RoomModel.findOne({
    _id: req.params.roomId,
    $or: [{ createdBy: req.userId }, { _id: memberRecord?.roomId }],
  }).lean();
  if (!room) throw ApiError.notFound('Room not found');
  ApiResponse.success(res, { room });
});

// GET /rooms/:roomId/members
export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const room = await RoomModel.findById(req.params.roomId).lean();
  if (!room) throw ApiError.notFound('Room not found');
  const members = await RoomMemberModel.find({ roomId: req.params.roomId }).sort({ joinedAt: 1 }).lean();
  ApiResponse.success(res, { members });
});

// POST /rooms/:roomId/members
export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone } = req.body as AddMemberInput;
  const room = await RoomModel.findOne({ _id: req.params.roomId, createdBy: req.userId });
  if (!room) throw ApiError.notFound('Room not found or access denied');

  const duplicate = await RoomMemberModel.findOne({ roomId: room._id, email: email.toLowerCase() });
  if (duplicate) throw ApiError.conflict('A member with this email already exists in this room');

  const member = await RoomMemberModel.create({ roomId: room._id, name, email, phone, addedBy: req.userId });
  ApiResponse.created(res, { member }, 'Member added');
});

// POST /rooms/join
export const joinRoom = asyncHandler(async (req: Request, res: Response) => {
  const { inviteCode } = req.body as { inviteCode: string };
  if (!inviteCode) throw ApiError.badRequest('Invite code is required');

  const room = await RoomModel.findOne({ inviteCode: inviteCode.trim().toUpperCase() }).lean();
  if (!room) throw ApiError.notFound('Invalid invite code. Please check and try again.');

  const user = await User.findById(req.userId).select('name email').lean();
  if (!user) throw ApiError.notFound('User not found');

  const existing = await RoomMemberModel.findOne({
    roomId: room._id,
    $or: [{ userId: req.userId }, { email: user.email.toLowerCase() }],
  });
  if (existing) throw ApiError.conflict('You are already a member of this room');

  const member = await RoomMemberModel.create({
    roomId: room._id,
    userId: req.userId,
    name: user.name,
    email: user.email,
    phone: '',
    addedBy: req.userId,
  });

  ApiResponse.created(res, { room, member }, 'Joined room successfully');
});

// PATCH /rooms/:roomId/members/:memberId
export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone } = req.body as UpdateMemberInput;

  const member = await RoomMemberModel.findById(req.params.memberId);
  if (!member) throw ApiError.notFound('Member not found');

  const room = await RoomModel.findOne({ _id: member.roomId, createdBy: req.userId });
  if (!room) throw ApiError.forbidden('Access denied');

  if (name !== undefined) member.name = name;
  if (phone !== undefined) member.phone = phone;
  await member.save();

  ApiResponse.success(res, { member }, 'Member updated');
});

// DELETE /rooms/:roomId/members/:memberId
export const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await RoomMemberModel.findById(req.params.memberId);
  if (!member) throw ApiError.notFound('Member not found');

  const room = await RoomModel.findOne({ _id: member.roomId, createdBy: req.userId });
  if (!room) throw ApiError.forbidden('Access denied');

  await member.deleteOne();
  ApiResponse.noContent(res);
});

// DELETE /rooms/:roomId
export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await RoomModel.findOne({ _id: req.params.roomId, createdBy: req.userId });
  if (!room) throw ApiError.notFound('Room not found or access denied');

  await RoomMemberModel.deleteMany({ roomId: room._id });
  await room.deleteOne();
  ApiResponse.noContent(res);
});
