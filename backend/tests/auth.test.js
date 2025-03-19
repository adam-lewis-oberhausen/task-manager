const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../index');
const User = require('../models/User');

let testServer;

beforeAll(async () => {
  // Start test server on a random available port
  testServer = app.listen(0); // 0 means random available port
  process.env.TEST_PORT = testServer.address().port;

  // Connect to the test database
  const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({});
  
  // Close connections
  await mongoose.connection.close();
  testServer.close();
});

describe('Auth Endpoints', () => {

  it('should register a new user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  it('should fail to register with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'weak',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toMatch(/Password must be at least 8 characters long/);
  });

  it('should fail to register with duplicate email', async () => {
    // Create initial user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

    // Try to create duplicate
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'AnotherPass123!',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toMatch(/Email is already in use/);
  });
});
