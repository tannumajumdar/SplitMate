import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import createApp from '../../app';

let mongod: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

describe('POST /api/v1/auth/send-otp', () => {
  it('rejects invalid phone number', async () => {
    const res = await request(app)
      .post('/api/v1/auth/send-otp')
      .send({ phone: '123' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('sends OTP for valid phone number', async () => {
    const res = await request(app)
      .post('/api/v1/auth/send-otp')
      .send({ phone: '+919876543210' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('expiresAt');
  });

  it('rate limits after 3 requests per minute', async () => {
    const phone = '+919876543211';
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/v1/auth/send-otp').send({ phone });
    }
    const res = await request(app).post('/api/v1/auth/send-otp').send({ phone });
    expect(res.status).toBe(429);
  });
});

describe('POST /api/v1/auth/verify-otp', () => {
  it('rejects wrong OTP', async () => {
    await request(app)
      .post('/api/v1/auth/send-otp')
      .send({ phone: '+919876543212' });

    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phone: '+919876543212', otp: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects OTP for non-existent phone', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phone: '+919999999999', otp: '123456' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/health', () => {
  it('returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('Unknown routes', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
  });
});
