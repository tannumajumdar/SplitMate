import { userRepository } from '../repositories/user.repository';
import { IUser, IUpdateUserDTO } from '../interfaces/user.interface';
import { ApiError } from '../utils/ApiError';
import { cloudinary } from '../config/cloudinary';
import { cache } from '../config/redis';
import { RefreshToken } from '../models/RefreshToken.model';

const USER_CACHE_TTL = 300; // 5 min

export class UserService {
  async getProfile(userId: string): Promise<IUser> {
    const cached = await cache.get<IUser>(`user:${userId}`);
    if (cached) return cached;

    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    await cache.set(`user:${userId}`, user, USER_CACHE_TTL);
    return user;
  }

  async updateProfile(userId: string, data: IUpdateUserDTO): Promise<IUser> {
    const user = await userRepository.update(userId, data as Record<string, unknown>);
    if (!user) throw ApiError.notFound('User not found');

    await cache.del(`user:${userId}`);
    return user;
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer, mimeType: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (user.profilePhoto?.includes('cloudinary')) {
      // Extract public_id from URL and delete
      try {
        const parts = user.profilePhoto.split('/');
        const publicId = parts.slice(-2).join('/').replace(/\.[^/.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      } catch { /* ignore */ }
    }

    const base64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'splitmate/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill', quality: 80 }],
      resource_type: 'image',
    });

    const updated = await userRepository.update(userId, {
      profilePhoto: result.secure_url,
    } as Record<string, unknown>);

    if (!updated) throw ApiError.internal('Profile update failed');
    await cache.del(`user:${userId}`);
    return updated;
  }

  async deleteAvatar(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const updated = await userRepository.updateRaw(userId, {
      $unset: { profilePhoto: 1 },
    });

    if (!updated) throw ApiError.internal();
    await cache.del(`user:${userId}`);
    return updated;
  }

  async searchUsers(query: string): Promise<Pick<IUser, '_id' | 'name' | 'email' | 'profilePhoto'>[]> {
    const users = await userRepository.findMany({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    });
    return users.map(({ _id, name, email, profilePhoto }) => ({ _id, name, email, profilePhoto }));
  }

  async deleteAccount(userId: string): Promise<void> {
    await userRepository.deactivate(userId);
    await RefreshToken.deleteMany({ userId });
    await cache.del(`user:${userId}`);
  }
}

export const userService = new UserService();
