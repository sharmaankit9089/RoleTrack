require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

beforeAll(async () => {
  const uri = process.env.MONGO_URI_TEST || 'mongodb://localhost:3000/RoleTrack';
  await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Auth', () => {
  test('health check', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
  }, 10000);
});
