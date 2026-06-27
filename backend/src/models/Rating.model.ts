import { Schema, model, Document, Types } from 'mongoose';

export interface IRating extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

RatingSchema.index({ userId: 1, createdAt: -1 });

export const Rating = model<IRating>('Rating', RatingSchema);
