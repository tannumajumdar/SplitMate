import { Request, Response } from 'express';
import { groupService } from '../services/group.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { CreateGroupInput, UpdateGroupInput, JoinGroupInput } from '../validators/group.validator';

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await groupService.createGroup(req.userId!, req.body as CreateGroupInput);
  ApiResponse.created(res, { group }, 'Group created');
});

export const getGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await groupService.getGroupById(req.params.groupId, req.userId!);
  ApiResponse.success(res, { group });
});

export const getUserGroups = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query as Record<string, string>;
  const result = await groupService.getUserGroups(req.userId!, page, limit, status);
  ApiResponse.paginated(res, result.data, result.pagination);
});

export const joinGroup = asyncHandler(async (req: Request, res: Response) => {
  const { inviteCode } = req.body as JoinGroupInput;
  const group = await groupService.joinGroup(req.userId!, inviteCode);
  ApiResponse.success(res, { group }, 'Joined group successfully');
});

export const leaveGroup = asyncHandler(async (req: Request, res: Response) => {
  await groupService.leaveGroup(req.params.groupId, req.userId!);
  ApiResponse.noContent(res);
});

export const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await groupService.updateGroup(
    req.params.groupId,
    req.userId!,
    req.body as UpdateGroupInput
  );
  ApiResponse.success(res, { group }, 'Group updated');
});

export const deleteGroup = asyncHandler(async (req: Request, res: Response) => {
  await groupService.deleteGroup(req.params.groupId, req.userId!);
  ApiResponse.noContent(res);
});

export const regenerateInviteCode = asyncHandler(async (req: Request, res: Response) => {
  const inviteCode = await groupService.regenerateInviteCode(req.params.groupId, req.userId!);
  ApiResponse.success(res, { inviteCode }, 'Invite code regenerated');
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  await groupService.removeMember(req.params.groupId, req.userId!, req.params.memberId);
  ApiResponse.noContent(res);
});
