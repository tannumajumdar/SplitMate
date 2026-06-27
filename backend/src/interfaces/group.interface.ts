import { Document, Types } from 'mongoose';

export type GroupStatus = 'active' | 'archived' | 'deleted';
export type GroupCategory = 'roommates' | 'flatmates' | 'hostel' | 'trip' | 'couple' | 'friends' | 'other';

export interface IGroupMember {
  userId: Types.ObjectId;
  role: 'admin' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

export interface IGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  category: GroupCategory;
  inviteCode: string;
  coverImage?: string;
  createdBy: Types.ObjectId;
  members: IGroupMember[];
  status: GroupStatus;
  totalExpenses: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateGroupDTO {
  name: string;
  description?: string;
  category?: GroupCategory;
  currency?: string;
}

export interface IUpdateGroupDTO {
  name?: string;
  description?: string | null;
  category?: GroupCategory;
}
