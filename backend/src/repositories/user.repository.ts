import { FilterQuery, UpdateQuery } from 'mongoose';
import { User } from '../models/User.model';
import { IUser, ICreateUserDTO, IUpdateUserDTO } from '../interfaces/user.interface';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select('+password').exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase().trim() }).select('+password').exec();
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId }).exec();
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })
      .select('+resetPasswordToken +resetPasswordExpires')
      .exec();
  }

  async create(data: ICreateUserDTO): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async update(id: string, data: IUpdateUserDTO & Record<string, unknown>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async updateRaw(id: string, update: UpdateQuery<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async findMany(filter: FilterQuery<IUser>): Promise<IUser[]> {
    return User.find(filter).exec();
  }

  async findManyByIds(ids: string[]): Promise<IUser[]> {
    return User.find({ _id: { $in: ids } }).exec();
  }

  async deactivate(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async exists(filter: FilterQuery<IUser>): Promise<boolean> {
    return !!(await User.exists(filter));
  }
}

export const userRepository = new UserRepository();
