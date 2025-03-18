const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');

let testUser;
let testToken;

beforeAll(async () => {
  // Create a test user
  testUser = new User({
    email: 'test@workspace.com',
    password: 'Test123!'
  });
  await testUser.save();

  // Generate a JWT token
  testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({});
  await Workspace.deleteMany({});
});

describe('Workspace API', () => {
  test('Create a new workspace', async () => {
    const response = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Test Workspace' })
      .expect(201);

    expect(response.body.name).toBe('Test Workspace');
    expect(response.body.owner.toString()).toBe(testUser._id.toString());
  });

  test('Get all workspaces for user', async () => {
    // Create a test workspace
    const workspace = new Workspace({
      name: 'Test Workspace',
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });
    await workspace.save();

    const response = await request(app)
      .get('/api/workspaces')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Test Workspace');
  });

  test('Get single workspace', async () => {
    const workspace = new Workspace({
      name: 'Test Workspace',
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });
    await workspace.save();

    const response = await request(app)
      .get(`/api/workspaces/${workspace._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.name).toBe('Test Workspace');
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
