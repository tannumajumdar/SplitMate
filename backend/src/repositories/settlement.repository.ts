import { FilterQuery } from 'mongoose';
import { Settlement } from '../models/Settlement.model';
import { ISettlement } from '../interfaces/settlement.interface';

export class SettlementRepository {
  async findById(id: string): Promise<ISettlement | null> {
    return Settlement.findById(id)
      .populate('payerId', 'name phone profilePhoto upiId')
      .populate('receiverId', 'name phone profilePhoto upiId')
      .exec();
  }

  async create(data: Record<string, unknown>): Promise<ISettlement> {
    const settlement = new Settlement(data);
    return settlement.save();
  }

  async update(id: string, data: Record<string, unknown>): Promise<ISettlement | null> {
    return Settlement.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async findByGroup(
    groupId: string,
    status?: string,
    skip = 0,
    limit = 10
  ): Promise<ISettlement[]> {
    const filter: FilterQuery<ISettlement> = { groupId };
    if (status) filter.status = status;

    return Settlement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('payerId', 'name phone profilePhoto upiId')
      .populate('receiverId', 'name phone profilePhoto upiId')
      .exec();
  }

  async countByGroup(groupId: string, status?: string): Promise<number> {
    const filter: FilterQuery<ISettlement> = { groupId };
    if (status) filter.status = status;
    return Settlement.countDocuments(filter).exec();
  }

  async findByUser(userId: string, status?: string, skip = 0, limit = 10): Promise<ISettlement[]> {
    const filter: FilterQuery<ISettlement> = {
      $or: [{ payerId: userId }, { receiverId: userId }],
    };
    if (status) filter.status = status;

    return Settlement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('payerId', 'name phone profilePhoto')
      .populate('receiverId', 'name phone profilePhoto')
      .exec();
  }

  async markCompleted(id: string, transactionId?: string): Promise<ISettlement | null> {
    return Settlement.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'completed',
          settledAt: new Date(),
          ...(transactionId && { transactionId }),
        },
      },
      { new: true }
    ).exec();
  }

  async cancel(id: string): Promise<ISettlement | null> {
    return Settlement.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    ).exec();
  }
}

export const settlementRepository = new SettlementRepository();
