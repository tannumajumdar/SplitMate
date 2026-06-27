import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  profilePhoto?: string;
  provider: 'email' | 'google';
  googleId?: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  isVerified: boolean;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserDTO {
  name: string;
  email: string;
  password?: string;
  provider?: 'email' | 'google';
  googleId?: string;
  profilePhoto?: string;
  isVerified?: boolean;
}

export interface IUpdateUserDTO {
  name?: string;
  currency?: string;
  language?: string;
  theme?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  profilePhoto?: string;
  profilePhotoPublicId?: string;
  fcmToken?: string;
}
