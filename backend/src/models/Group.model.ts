import mongoose, { Schema } from 'mongoose';
import { IGroup, GroupCategory, GroupStatus } from '../interfaces/group.interface';

const GroupMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const GroupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['roommates', 'flatmates', 'hostel', 'trip', 'couple', 'friends', 'other'] as GroupCategory[],
      default: 'other',
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    coverImage: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [GroupMemberSchema], default: [] },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'] as GroupStatus[],
      default: 'active',
    },
    totalExpenses: { type: Number, default: 0 },
    currency: { type: String, default: 'INR', maxlength: 3 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_doc, ret) => { delete ret.__v; return ret; } },
  }
);

GroupSchema.index({ inviteCode: 1 });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ createdBy: 1 });
GroupSchema.index({ status: 1 });

GroupSchema.virtual('memberCount').get(function () {
  return this.members.filter((m) => m.isActive).length;
});

export const Group = mongoose.model<IGroup>('Group', GroupSchema);
