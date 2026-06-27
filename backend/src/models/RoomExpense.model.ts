import { Schema, model, Document, Types } from 'mongoose';

export interface IRoomExpenseSplit {
  memberId: Types.ObjectId;
  memberName: string;
  amount: number;
  percentage?: number;
  isPaid: boolean;
}

export interface IRoomExpense extends Document {
  _id: Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  paidBy: Types.ObjectId;
  paidByName: string;
  roomId: Types.ObjectId;
  splitMethod: string;
  splits: IRoomExpenseSplit[];
  notes?: string;
  date: Date;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SplitSchema = new Schema<IRoomExpenseSplit>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'RoomMember', required: true },
    memberName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    isPaid: { type: Boolean, default: false },
  },
  { _id: false }
);

const RoomExpenseSchema = new Schema<IRoomExpense>(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    amount: { type: Number, required: true, min: 0.01 },
    category: {
      type: String,
      enum: ['food', 'rent', 'utilities', 'groceries', 'transport', 'entertainment', 'health', 'shopping', 'internet', 'other'],
      default: 'other',
    },
    paidBy: { type: Schema.Types.ObjectId, ref: 'RoomMember', required: true },
    paidByName: { type: String, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    splitMethod: { type: String, enum: ['equal', 'percentage', 'custom'], required: true },
    splits: { type: [SplitSchema], required: true },
    notes: { type: String, trim: true, maxlength: 500 },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

RoomExpenseSchema.index({ roomId: 1, date: -1 });
RoomExpenseSchema.index({ roomId: 1, isDeleted: 1, createdAt: -1 });

export const RoomExpense = model<IRoomExpense>('RoomExpense', RoomExpenseSchema);
