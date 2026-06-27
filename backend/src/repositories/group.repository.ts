import { FilterQuery } from 'mongoose';
import { Group } from '../models/Group.model';
import { IGroup, ICreateGroupDTO, IUpdateGroupDTO } from '../interfaces/group.interface';

export class GroupRepository {
  async findById(id: string): Promise<IGroup | null> {
    return Group.findById(id).exec();
  }

  async findByIdPopulated(id: string): Promise<IGroup | null> {
    return Group.findById(id)
      .populate('members.userId', 'name phone profilePhoto upiId')
      .populate('createdBy', 'name phone profilePhoto')
      .exec();
  }

  async findByInviteCode(code: string): Promise<IGroup | null> {
    return Group.findOne({ inviteCode: code.toUpperCase(), status: 'active' }).exec();
  }

  async create(data: ICreateGroupDTO & Record<string, unknown>): Promise<IGroup> {
    const group = new Group(data);
    return group.save();
  }

  async update(id: string, data: IUpdateGroupDTO & Record<string, unknown>): Promise<IGroup | null> {
    return Group.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async findUserGroups(
    userId: string,
    status?: string,
    skip = 0,
    limit = 10
  ): Promise<IGroup[]> {
    const filter: FilterQuery<IGroup> = {
      'members.userId': userId,
      'members.isActive': true,
    };
    if (status) filter.status = status;
    else filter.status = { $ne: 'deleted' };

    return Group.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name phone profilePhoto')
      .exec();
  }

  async countUserGroups(userId: string, status?: string): Promise<number> {
    const filter: FilterQuery<IGroup> = {
      'members.userId': userId,
      'members.isActive': true,
    };
    if (status) filter.status = status;
    else filter.status = { $ne: 'deleted' };
    return Group.countDocuments(filter).exec();
  }

  async addMember(
    groupId: string,
    userId: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<IGroup | null> {
    return Group.findByIdAndUpdate(
      groupId,
      { $push: { members: { userId, role, joinedAt: new Date(), isActive: true } } },
      { new: true }
    ).exec();
  }

  async removeMember(groupId: string, userId: string): Promise<IGroup | null> {
    return Group.findByIdAndUpdate(
      groupId,
      { $set: { 'members.$[elem].isActive': false } },
      { arrayFilters: [{ 'elem.userId': userId }], new: true }
    ).exec();
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const group = await Group.findOne({
      _id: groupId,
      members: { $elemMatch: { userId, isActive: true } },
    }).exec();
    return !!group;
  }

  async isAdmin(groupId: string, userId: string): Promise<boolean> {
    const group = await Group.findOne({
      _id: groupId,
      members: { $elemMatch: { userId, role: 'admin', isActive: true } },
    }).exec();
    return !!group;
  }

  async incrementTotalExpenses(groupId: string, amount: number): Promise<void> {
    await Group.findByIdAndUpdate(groupId, { $inc: { totalExpenses: amount } }).exec();
  }

  async softDelete(groupId: string): Promise<void> {
    await Group.findByIdAndUpdate(groupId, { status: 'deleted' }).exec();
  }
}

export const groupRepository = new GroupRepository();
