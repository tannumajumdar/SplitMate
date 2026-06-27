import { groupRepository } from '../repositories/group.repository';
import { IGroup, ICreateGroupDTO, IUpdateGroupDTO } from '../interfaces/group.interface';
import { ApiError } from '../utils/ApiError';
import { generateInviteCode } from '../utils/inviteCode';
import { getPaginationOptions, buildPaginationMeta, getSkip } from '../utils/pagination';
import { PaginatedResult } from '../types/common.types';
import { notificationService } from './notification.service';
import { cache } from '../config/redis';

export class GroupService {
  async createGroup(userId: string, data: ICreateGroupDTO): Promise<IGroup> {
    let inviteCode: string;
    let attempts = 0;
    do {
      inviteCode = generateInviteCode();
      attempts++;
      if (attempts > 10) throw ApiError.internal('Could not generate unique invite code');
    } while (await groupRepository.findByInviteCode(inviteCode));

    const group = await groupRepository.create({
      ...data,
      inviteCode,
      createdBy: userId,
      members: [{ userId, role: 'admin', joinedAt: new Date(), isActive: true }],
    });

    return group;
  }

  async getGroupById(groupId: string, userId: string): Promise<IGroup> {
    const group = await groupRepository.findByIdPopulated(groupId);
    if (!group || group.status === 'deleted') throw ApiError.notFound('Group not found');

    const isMember = await groupRepository.isMember(groupId, userId);
    if (!isMember) throw ApiError.forbidden('You are not a member of this group');

    return group;
  }

  async getUserGroups(
    userId: string,
    queryPage?: string,
    queryLimit?: string,
    status?: string
  ): Promise<PaginatedResult<IGroup>> {
    const { page, limit } = getPaginationOptions(queryPage, queryLimit);
    const skip = getSkip(page, limit);

    const [groups, total] = await Promise.all([
      groupRepository.findUserGroups(userId, status, skip, limit),
      groupRepository.countUserGroups(userId, status),
    ]);

    return { data: groups, pagination: buildPaginationMeta(total, page, limit) };
  }

  async joinGroup(userId: string, inviteCode: string): Promise<IGroup> {
    const group = await groupRepository.findByInviteCode(inviteCode);
    if (!group) throw ApiError.notFound('Invalid invite code');
    if (group.status !== 'active') throw ApiError.badRequest('Group is no longer active');

    const alreadyMember = await groupRepository.isMember(group._id.toString(), userId);
    if (alreadyMember) throw ApiError.conflict('You are already a member of this group');

    const updated = await groupRepository.addMember(group._id.toString(), userId, 'member');
    if (!updated) throw ApiError.internal();

    await notificationService.notifyGroupMembers(
      group._id.toString(),
      userId,
      'group_joined',
      'New member joined',
      `A new member joined "${group.name}"`
    );

    return updated;
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    await this.assertMembership(groupId, userId);

    const group = await groupRepository.findById(groupId);
    if (!group) throw ApiError.notFound('Group not found');

    const isAdmin = await groupRepository.isAdmin(groupId, userId);
    const activeMembers = group.members.filter((m) => m.isActive);

    if (isAdmin && activeMembers.length > 1) {
      throw ApiError.badRequest(
        'Transfer admin role to another member before leaving'
      );
    }

    await groupRepository.removeMember(groupId, userId);

    if (activeMembers.length === 1) {
      await groupRepository.softDelete(groupId);
    }

    await cache.del(`group:${groupId}`);
  }

  async updateGroup(groupId: string, userId: string, data: IUpdateGroupDTO): Promise<IGroup> {
    await this.assertAdmin(groupId, userId);

    const updated = await groupRepository.update(groupId, data as Record<string, unknown>);
    if (!updated) throw ApiError.notFound('Group not found');

    await cache.del(`group:${groupId}`);
    return updated;
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    await this.assertAdmin(groupId, userId);
    await groupRepository.softDelete(groupId);
    await cache.del(`group:${groupId}`);
  }

  async regenerateInviteCode(groupId: string, userId: string): Promise<string> {
    await this.assertAdmin(groupId, userId);

    let inviteCode: string;
    do {
      inviteCode = generateInviteCode();
    } while (await groupRepository.findByInviteCode(inviteCode));

    await groupRepository.update(groupId, { inviteCode } as Record<string, unknown>);
    return inviteCode;
  }

  async removeMember(groupId: string, adminId: string, memberId: string): Promise<void> {
    await this.assertAdmin(groupId, adminId);
    if (adminId === memberId) throw ApiError.badRequest('Use leave group to remove yourself');

    const isMember = await groupRepository.isMember(groupId, memberId);
    if (!isMember) throw ApiError.notFound('User is not a member of this group');

    await groupRepository.removeMember(groupId, memberId);
  }

  private async assertMembership(groupId: string, userId: string): Promise<void> {
    const isMember = await groupRepository.isMember(groupId, userId);
    if (!isMember) throw ApiError.forbidden('You are not a member of this group');
  }

  private async assertAdmin(groupId: string, userId: string): Promise<void> {
    const isAdmin = await groupRepository.isAdmin(groupId, userId);
    if (!isAdmin) throw ApiError.forbidden('Admin access required');
  }
}

export const groupService = new GroupService();
