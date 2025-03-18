const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close the database connection
    await mongoose.connection.close();
  });

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
    expect(res.body).toMatch(/Password must be at least 8 characters long/);
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
    expect(res.body).toMatch(/Email is already in use/);
  });
});
