import mongoose, { Schema } from 'mongoose';
import { ISettlement, SettlementStatus, PaymentMethod } from '../interfaces/settlement.interface';

const SettlementSchema = new Schema<ISettlement>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    payerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: [0.01, 'Amount must be positive'] },
    paymentMethod: {
      type: String,
      enum: ['upi', 'cash', 'bank_transfer', 'other'] as PaymentMethod[],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'] as SettlementStatus[],
      default: 'pending',
    },
    transactionId: { type: String, trim: true },
    note: { type: String, trim: true, maxlength: 300 },
    settledAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { transform: (_doc, ret) => { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

SettlementSchema.index({ groupId: 1, status: 1 });
SettlementSchema.index({ payerId: 1 });
SettlementSchema.index({ receiverId: 1 });
SettlementSchema.index({ createdAt: -1 });

export const Settlement = mongoose.model<ISettlement>('Settlement', SettlementSchema);
