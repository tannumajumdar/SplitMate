import mongoose, { Schema, Document } from 'mongoose';

export interface IOTPVerification extends Document {
  phone: string;
  name?: string;
  otp: string;
  attempts: number;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const OTPVerificationSchema = new Schema<IOTPVerification>(
  {
    phone: { type: String, required: true, index: true },
    name: { type: String, trim: true },
    otp: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OTPVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTPVerification = mongoose.model<IOTPVerification>(
  'OTPVerification',
  OTPVerificationSchema
);
