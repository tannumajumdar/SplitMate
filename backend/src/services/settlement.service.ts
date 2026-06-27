import mongoose from 'mongoose';
import { settlementRepository } from '../repositories/settlement.repository';
import { groupRepository } from '../repositories/group.repository';
import { ISettlement } from '../interfaces/settlement.interface';
import { ICreateSettlementDTO } from '../interfaces/settlement.interface';
import { ApiError } from '../utils/ApiError';
import { getPaginationOptions, buildPaginationMeta, getSkip } from '../utils/pagination';
import { PaginatedResult } from '../types/common.types';
import { notificationService } from './notification.service';
import { balanceService } from './balance.service';

export class SettlementService {
  async createSettlement(
    payerId: string,
    data: ICreateSettlementDTO
  ): Promise<ISettlement> {
    if (payerId === data.receiverId)
      throw ApiError.badRequest('Cannot create settlement with yourself');

    const isMember = await groupRepository.isMember(data.groupId, payerId);
    if (!isMember) throw ApiError.forbidden('Not a group member');

    const isReceiverMember = await groupRepository.isMember(data.groupId, data.receiverId);
    if (!isReceiverMember) throw ApiError.badRequest('Receiver is not a group member');

    const settlement = await settlementRepository.create({
      groupId: new mongoose.Types.ObjectId(data.groupId),
      payerId: new mongoose.Types.ObjectId(payerId),
      receiverId: new mongoose.Types.ObjectId(data.receiverId),
      amount: data.amount,
      paymentMethod: data.paymentMethod ?? 'cash',
      note: data.note,
      transactionId: data.transactionId,
    });

    await notificationService.createNotification({
      userId: data.receiverId,
      type: 'settlement_created',
      title: 'Settlement Request',
      message: `Someone is settling ₹${data.amount.toFixed(2)} with you`,
      data: { settlementId: settlement._id.toString(), groupId: data.groupId },
    });

    return settlement;
  }

  async getSettlement(settlementId: string, userId: string): Promise<ISettlement> {
    const settlement = await settlementRepository.findById(settlementId);
    if (!settlement) throw ApiError.notFound('Settlement not found');

    const isInvolved =
      settlement.payerId.toString() === userId ||
      settlement.receiverId.toString() === userId;
    if (!isInvolved) throw ApiError.forbidden('Access denied');

    return settlement;
  }

  async getGroupSettlements(
    groupId: string,
    userId: string,
    queryPage?: string,
    queryLimit?: string,
    status?: string
  ): Promise<PaginatedResult<ISettlement>> {
    const isMember = await groupRepository.isMember(groupId, userId);
    if (!isMember) throw ApiError.forbidden('Not a group member');

    const { page, limit } = getPaginationOptions(queryPage, queryLimit);
    const skip = getSkip(page, limit);

    const [settlements, total] = await Promise.all([
      settlementRepository.findByGroup(groupId, status, skip, limit),
      settlementRepository.countByGroup(groupId, status),
    ]);

    return { data: settlements, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getPendingSettlements(userId: string): Promise<ISettlement[]> {
    return settlementRepository.findByUser(userId, 'pending');
  }

  async markSettlementPaid(
    settlementId: string,
    receiverId: string,
    transactionId?: string
  ): Promise<ISettlement> {
    const settlement = await settlementRepository.findById(settlementId);
    if (!settlement) throw ApiError.notFound('Settlement not found');

    if (settlement.receiverId.toString() !== receiverId)
      throw ApiError.forbidden('Only the receiver can mark as paid');

    if (settlement.status !== 'pending')
      throw ApiError.badRequest(`Settlement is already ${settlement.status}`);

    const updated = await settlementRepository.markCompleted(settlementId, transactionId);
    if (!updated) throw ApiError.internal();

    await balanceService.invalidateCache(settlement.groupId.toString());

    await notificationService.createNotification({
      userId: settlement.payerId.toString(),
      type: 'settlement_completed',
      title: 'Payment Confirmed',
      message: `Your payment of ₹${settlement.amount.toFixed(2)} has been confirmed`,
      data: { settlementId: settlement._id.toString() },
    });

    return updated;
  }

  async cancelSettlement(settlementId: string, userId: string): Promise<ISettlement> {
    const settlement = await settlementRepository.findById(settlementId);
    if (!settlement) throw ApiError.notFound('Settlement not found');

    const isInvolved =
      settlement.payerId.toString() === userId ||
      settlement.receiverId.toString() === userId;
    if (!isInvolved) throw ApiError.forbidden('Access denied');

    if (settlement.status !== 'pending')
      throw ApiError.badRequest(`Cannot cancel a ${settlement.status} settlement`);

    const updated = await settlementRepository.cancel(settlementId);
    if (!updated) throw ApiError.internal();
    return updated;
  }
}

export const settlementService = new SettlementService();
