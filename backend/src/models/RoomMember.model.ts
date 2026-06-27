import { Schema, model, Document, Types } from 'mongoose';

export interface IRoomMember extends Document {
  _id: Types.ObjectId;
  roomId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  addedBy: Types.ObjectId;
  joinedAt: Date;
}

const RoomMemberSchema = new Schema<IRoomMember>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: false, trim: true, lowercase: true, maxlength: 255, default: '' },
    phone: { type: String, required: false, trim: true, maxlength: 20, default: '' },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

RoomMemberSchema.index({ roomId: 1, joinedAt: 1 });

export const RoomMemberModel = model<IRoomMember>('RoomMember', RoomMemberSchema);
