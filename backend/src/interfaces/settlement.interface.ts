import { Document, Types } from 'mongoose';

export type SettlementStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentMethod = 'upi' | 'cash' | 'bank_transfer' | 'other';

export interface ISettlement extends Document {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  payerId: Types.ObjectId;
  receiverId: Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  status: SettlementStatus;
  transactionId?: string;
  note?: string;
  settledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSettlementDTO {
  groupId: string;
  receiverId: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  note?: string;
  transactionId?: string;
}

export interface IBalanceEntry {
  userId: string;
  name: string;
  phone: string;
  profilePhoto?: string;
  amount: number;
}

export interface IGroupBalance {
  owes: IBalanceEntry[];
  isOwed: IBalanceEntry[];
  netBalance: number;
}

export interface ISimplifiedDebt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}
