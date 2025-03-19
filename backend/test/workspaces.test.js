const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../index');
let testServer;

beforeAll(async () => {
  // Start test server on a different port
  testServer = app.listen(5001);
});
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');

let testUser;
let testToken;

beforeEach(async () => {
  // Connect to the test database
  const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);

  // Create a unique test user for each test
  const uniqueEmail = `test${Date.now()}@workspace.com`;
  testUser = new User({
    email: uniqueEmail,
    password: 'Test123!'
  });
  await testUser.save();

  // Generate a JWT token
  testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
});

afterEach(async () => {
  // Clean up test data after each test
  await User.deleteMany({});
  await Workspace.deleteMany({});
});

afterAll(async () => {
  // Close connections
  await mongoose.connection.close();
  testServer.close();
});

describe('Workspace API', () => {
  test('Create a new workspace', async () => {
    const workspaceName = `Test Workspace ${Date.now()}`;
    const response = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: workspaceName })
      .expect(201);

    expect(response.body.name).toBe(workspaceName);
    expect(response.body.owner.toString()).toBe(testUser._id.toString());
  });

  test('Get all workspaces for user', async () => {
    // Create a test workspace
    const workspaceName = `Test Workspace ${Date.now()}`;
    const workspace = new Workspace({
      name: workspaceName,
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });
    await workspace.save();

    const response = await request(app)
      .get('/api/workspaces')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe(workspaceName);
  });

  test('Get single workspace', async () => {
    const workspaceName = `Test Workspace ${Date.now()}`;
    const workspace = new Workspace({
      name: workspaceName,
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });
    await workspace.save();

    const response = await request(app)
      .get(`/api/workspaces/${workspace._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.name).toBe(workspaceName);
  });

  test('Update workspace', async () => {
    const workspace = new Workspace({
      name: 'Test Workspace',
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });
    await workspace.save();

    const response = await request(app)
      .patch(`/api/workspaces/${workspace._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Updated Workspace' })
      .expect(200);

    expect(response.body.name).toBe('Updated Workspace');
  });

  test('Delete workspace', async () => {
    const workspace = new Workspace({
      name: 'Test Workspace',
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });
    await workspace.save();

    await request(app)
      .delete(`/api/workspaces/${workspace._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    // Verify deletion
    const deletedWorkspace = await Workspace.findById(workspace._id);
    expect(deletedWorkspace).toBeNull();
  });
});
