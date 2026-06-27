import { calculateSplits, calculateGroupBalances, simplifyDebts } from '../../utils/balanceCalculator';
import { IExpense } from '../../interfaces/expense.interface';
import mongoose from 'mongoose';

const uid = (name: string) => new mongoose.Types.ObjectId().toString();

describe('calculateSplits', () => {
  const members = ['user1', 'user2', 'user3'];

  it('splits equally among all members', () => {
    const splits = calculateSplits(3000, members, 'equal');
    expect(splits).toHaveLength(3);
    const total = splits.reduce((s, x) => s + x.amount, 0);
    expect(total).toBeCloseTo(3000, 2);
    splits.forEach((s) => expect(s.amount).toBeCloseTo(1000, 2));
  });

  it('handles equal split with non-divisible amount', () => {
    const splits = calculateSplits(100, ['u1', 'u2', 'u3'], 'equal');
    const total = splits.reduce((s, x) => s + x.amount, 0);
    expect(total).toBeCloseTo(100, 2);
  });

  it('splits by percentage', () => {
    const inputs = [
      { userId: 'user1', percentage: 50 },
      { userId: 'user2', percentage: 30 },
      { userId: 'user3', percentage: 20 },
    ];
    const splits = calculateSplits(3000, members, 'percentage', inputs);
    expect(splits[0].amount).toBeCloseTo(1500, 2);
    expect(splits[1].amount).toBeCloseTo(900, 2);
    expect(splits[2].amount).toBeCloseTo(600, 2);
  });

  it('throws when percentages do not sum to 100', () => {
    const inputs = [
      { userId: 'user1', percentage: 50 },
      { userId: 'user2', percentage: 30 },
    ];
    expect(() => calculateSplits(3000, members, 'percentage', inputs)).toThrow();
  });

  it('splits by exact amounts', () => {
    const inputs = [
      { userId: 'user1', amount: 1200 },
      { userId: 'user2', amount: 1000 },
      { userId: 'user3', amount: 800 },
    ];
    const splits = calculateSplits(3000, members, 'exact', inputs);
    expect(splits[0].amount).toBe(1200);
    expect(splits[1].amount).toBe(1000);
    expect(splits[2].amount).toBe(800);
  });

  it('throws when exact amounts do not sum to total', () => {
    const inputs = [
      { userId: 'user1', amount: 1000 },
      { userId: 'user2', amount: 500 },
    ];
    expect(() => calculateSplits(3000, ['user1', 'user2'], 'exact', inputs)).toThrow();
  });
});

describe('calculateGroupBalances', () => {
  const makeOid = () => new mongoose.Types.ObjectId();

  it('returns zero balance for no expenses', () => {
    const balances = calculateGroupBalances([]);
    expect(Object.keys(balances)).toHaveLength(0);
  });

  it('correctly calculates who owes whom', () => {
    const payer = makeOid();
    const member1 = makeOid();
    const member2 = makeOid();

    const expense = {
      _id: makeOid(),
      isDeleted: false,
      amount: 300,
      paidBy: payer,
      splits: [
        { userId: payer, amount: 100, isSettled: true },
        { userId: member1, amount: 100, isSettled: false },
        { userId: member2, amount: 100, isSettled: false },
      ],
    } as unknown as IExpense;

    const balances = calculateGroupBalances([expense]);
    expect(balances[payer.toString()]).toBeCloseTo(200, 2);
    expect(balances[member1.toString()]).toBeCloseTo(-100, 2);
    expect(balances[member2.toString()]).toBeCloseTo(-100, 2);
  });

  it('ignores deleted expenses', () => {
    const payer = makeOid();
    const expense = {
      isDeleted: true,
      paidBy: payer,
      splits: [{ userId: payer, amount: 500, isSettled: false }],
    } as unknown as IExpense;
    const balances = calculateGroupBalances([expense]);
    expect(Object.keys(balances)).toHaveLength(0);
  });
});

describe('simplifyDebts', () => {
  it('reduces 3-way debt to minimal transactions', () => {
    const balances = { A: 200, B: -100, C: -100 };
    const names = { A: 'Alice', B: 'Bob', C: 'Carol' };
    const debts = simplifyDebts(balances, names);
    expect(debts).toHaveLength(2);
    const total = debts.reduce((s, d) => s + d.amount, 0);
    expect(total).toBeCloseTo(200, 2);
  });

  it('returns empty array when everyone is even', () => {
    const debts = simplifyDebts({ A: 0, B: 0 }, { A: 'A', B: 'B' });
    expect(debts).toHaveLength(0);
  });
});
