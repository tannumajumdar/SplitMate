import { IExpense, IExpenseSplitItem } from '../interfaces/expense.interface';
import { ISimplifiedDebt } from '../interfaces/settlement.interface';

interface UserBalance {
  [userId: string]: number; // positive = is owed, negative = owes
}

/**
 * Calculate net balance for each user in a group from expense list.
 * Result: positive means user is owed that amount, negative means user owes.
 */
export const calculateGroupBalances = (expenses: IExpense[]): UserBalance => {
  const balances: UserBalance = {};

  const ensure = (id: string) => {
    if (balances[id] === undefined) balances[id] = 0;
  };

  for (const expense of expenses) {
    if (expense.isDeleted) continue;

    const payerId = expense.paidBy.toString();
    ensure(payerId);

    for (const split of expense.splits as IExpenseSplitItem[]) {
      const memberId = split.userId.toString();
      ensure(memberId);

      if (split.isSettled) continue;

      if (memberId !== payerId) {
        balances[payerId] += split.amount;   // payer is owed
        balances[memberId] -= split.amount;  // member owes
      }
    }
  }

  return balances;
};

/**
 * Greedy debt simplification algorithm.
 * Reduces N*(N-1)/2 possible transactions to at most N-1 transactions.
 */
export const simplifyDebts = (
  balances: UserBalance,
  userNames: Record<string, string>
): ISimplifiedDebt[] => {
  const creditors: Array<{ id: string; amount: number }> = [];
  const debtors: Array<{ id: string; amount: number }> = [];

  for (const [id, amount] of Object.entries(balances)) {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded > 0.009) creditors.push({ id, amount: rounded });
    else if (rounded < -0.009) debtors.push({ id, amount: Math.abs(rounded) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: ISimplifiedDebt[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    const settled = Math.min(credit.amount, debt.amount);

    transactions.push({
      from: debt.id,
      fromName: userNames[debt.id] ?? debt.id,
      to: credit.id,
      toName: userNames[credit.id] ?? credit.id,
      amount: Math.round(settled * 100) / 100,
    });

    credit.amount -= settled;
    debt.amount -= settled;

    if (credit.amount < 0.009) ci++;
    if (debt.amount < 0.009) di++;
  }

  return transactions;
};

/**
 * Calculate split amounts based on split type.
 */
export const calculateSplits = (
  totalAmount: number,
  memberIds: string[],
  splitType: 'equal' | 'percentage' | 'exact',
  inputs?: Array<{ userId: string; amount?: number; percentage?: number }>
): Array<{ userId: string; amount: number; percentage: number }> => {
  const count = memberIds.length;

  if (splitType === 'equal') {
    const perPerson = Math.floor((totalAmount / count) * 100) / 100;
    const remainder = Math.round((totalAmount - perPerson * count) * 100) / 100;
    return memberIds.map((userId, idx) => ({
      userId,
      amount: idx === 0 ? perPerson + remainder : perPerson,
      percentage: Math.round((1 / count) * 10000) / 100,
    }));
  }

  if (splitType === 'percentage') {
    if (!inputs) throw new Error('Percentage splits require inputs');
    const totalPct = inputs.reduce((s, i) => s + (i.percentage ?? 0), 0);
    if (Math.abs(totalPct - 100) > 0.01) throw new Error('Percentages must sum to 100');
    return inputs.map((i) => ({
      userId: i.userId,
      amount: Math.round((totalAmount * (i.percentage ?? 0)) / 100 * 100) / 100,
      percentage: i.percentage ?? 0,
    }));
  }

  if (splitType === 'exact') {
    if (!inputs) throw new Error('Exact splits require inputs');
    const totalExact = inputs.reduce((s, i) => s + (i.amount ?? 0), 0);
    if (Math.abs(totalExact - totalAmount) > 0.01)
      throw new Error(`Exact amounts (${totalExact}) must sum to total (${totalAmount})`);
    return inputs.map((i) => ({
      userId: i.userId,
      amount: i.amount ?? 0,
      percentage: Math.round(((i.amount ?? 0) / totalAmount) * 10000) / 100,
    }));
  }

  throw new Error('Invalid split type');
};
