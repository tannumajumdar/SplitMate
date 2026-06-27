import { expenseRepository } from '../repositories/expense.repository';
import { groupRepository } from '../repositories/group.repository';
import { userRepository } from '../repositories/user.repository';
import { calculateGroupBalances, simplifyDebts } from '../utils/balanceCalculator';
import { ApiError } from '../utils/ApiError';
import { IGroupBalance, ISimplifiedDebt } from '../interfaces/settlement.interface';
import { cache } from '../config/redis';

const BALANCE_CACHE_TTL = 60; // 1 min

export class BalanceService {
  async getGroupBalances(
    groupId: string,
    userId: string
  ): Promise<{
    balances: Record<string, number>;
    simplifiedDebts: ISimplifiedDebt[];
    myBalance: IGroupBalance;
  }> {
    const isMember = await groupRepository.isMember(groupId, userId);
    if (!isMember) throw ApiError.forbidden('Not a group member');

    const cacheKey = `balance:${groupId}`;
    const cached = await cache.get<{
      balances: Record<string, number>;
      simplifiedDebts: ISimplifiedDebt[];
    }>(cacheKey);

    let balances: Record<string, number>;
    let simplifiedDebts: ISimplifiedDebt[];

    if (cached) {
      balances = cached.balances;
      simplifiedDebts = cached.simplifiedDebts;
    } else {
      const expenses = await expenseRepository.findAllByGroup(groupId);
      balances = calculateGroupBalances(expenses);

      const memberIds = Object.keys(balances);
      const users = await userRepository.findManyByIds(memberIds);
      const userNames: Record<string, string> = {};
      users.forEach((u) => { userNames[u._id.toString()] = u.name; });

      simplifiedDebts = simplifyDebts(balances, userNames);
      await cache.set(cacheKey, { balances, simplifiedDebts }, BALANCE_CACHE_TTL);
    }

    const myBalance = this.buildMyBalance(userId, balances, simplifiedDebts);
    return { balances, simplifiedDebts, myBalance };
  }

  async getUserOverallBalance(userId: string): Promise<{
    totalOwed: number;
    totalReceivable: number;
    netBalance: number;
    byGroup: Array<{ groupId: string; groupName: string; netBalance: number }>;
  }> {
    const groups = await groupRepository.findUserGroups(userId);
    const byGroup: Array<{ groupId: string; groupName: string; netBalance: number }> = [];

    let totalOwed = 0;
    let totalReceivable = 0;

    for (const group of groups) {
      const expenses = await expenseRepository.findAllByGroup(group._id.toString());
      const balances = calculateGroupBalances(expenses);
      const myBal = balances[userId] ?? 0;

      byGroup.push({
        groupId: group._id.toString(),
        groupName: group.name,
        netBalance: Math.round(myBal * 100) / 100,
      });

      if (myBal > 0) totalReceivable += myBal;
      else totalOwed += Math.abs(myBal);
    }

    return {
      totalOwed: Math.round(totalOwed * 100) / 100,
      totalReceivable: Math.round(totalReceivable * 100) / 100,
      netBalance: Math.round((totalReceivable - totalOwed) * 100) / 100,
      byGroup,
    };
  }

  invalidateCache(groupId: string): Promise<void> {
    return cache.del(`balance:${groupId}`);
  }

  private buildMyBalance(
    userId: string,
    balances: Record<string, number>,
    simplifiedDebts: ISimplifiedDebt[]
  ): IGroupBalance {
    const myNetBalance = Math.round((balances[userId] ?? 0) * 100) / 100;

    const owes = simplifiedDebts
      .filter((d) => d.from === userId)
      .map((d) => ({ userId: d.to, name: d.toName, phone: '', amount: d.amount }));

    const isOwed = simplifiedDebts
      .filter((d) => d.to === userId)
      .map((d) => ({ userId: d.from, name: d.fromName, phone: '', amount: d.amount }));

    return { owes, isOwed, netBalance: myNetBalance };
  }
}

export const balanceService = new BalanceService();
