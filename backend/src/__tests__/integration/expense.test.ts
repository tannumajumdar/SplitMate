import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import createApp from '../../app';
import { User } from '../../models/User.model';
import { Group } from '../../models/Group.model';
import { generateTokenPair } from '../../utils/jwt';

let mongod: MongoMemoryServer;
const app = createApp();

let accessToken: string;
let userId: string;
let groupId: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();

  const user = await User.create({
    name: 'Test User',
    phone: '+919876543210',
    isVerified: true,
    isActive: true,
  });
  userId = user._id.toString();

  const member = await User.create({
    name: 'Member User',
    phone: '+919876543211',
    isVerified: true,
    isActive: true,
  });

  const group = await Group.create({
    name: 'Test Group',
    inviteCode: 'TEST1234',
    createdBy: userId,
    members: [
      { userId, role: 'admin', joinedAt: new Date(), isActive: true },
      { userId: member._id, role: 'member', joinedAt: new Date(), isActive: true },
    ],
  });
  groupId = group._id.toString();

  const tokens = generateTokenPair({ userId, phone: '+919876543210' });
  accessToken = tokens.accessToken;
});

describe('POST /api/v1/groups/:groupId/expenses', () => {
  it('creates an equal split expense', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Groceries',
        amount: 600,
        category: 'groceries',
        paidBy: userId,
        groupId,
        splitType: 'equal',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.title).toBe('Groceries');
    expect(res.body.data.expense.amount).toBe(600);
    expect(res.body.data.expense.splits).toHaveLength(2);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/expenses`)
      .send({ title: 'Test', amount: 100, paidBy: userId, groupId, splitType: 'equal' });
    expect(res.status).toBe(401);
  });

  it('validates amount is positive', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test',
        amount: -100,
        paidBy: userId,
        groupId,
        splitType: 'equal',
      });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/groups/:groupId/expenses', () => {
  it('returns paginated expenses for group members', async () => {
    const res = await request(app)
      .get(`/api/v1/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });
});
