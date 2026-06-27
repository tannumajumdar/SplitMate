import { Schema, model, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inviteCode: { type: String, unique: true, uppercase: true, sparse: true },
  },
  { timestamps: true }
);

RoomSchema.index({ createdBy: 1, createdAt: -1 });

export const RoomModel = model<IRoom>('Room', RoomSchema);
