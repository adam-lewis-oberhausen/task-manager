const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { app } = require('../index');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// Define test constants
const TEST_PASSWORD = 'ValidPass123!';
const TEST_EMAIL = (suffix) => `test${suffix}@example.com`;

describe('Project API', () => {
  let testUser, testWorkspace, testToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: TEST_EMAIL(Date.now()),
      password: TEST_PASSWORD
    });

    // Create test workspace
    testWorkspace = await Workspace.create({
      name: 'Test Workspace',
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });

    // Generate token
    testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
  });

  afterEach(async () => {
    await Project.deleteMany({});
    await Workspace.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Create project - success', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Test Project',
        workspace: testWorkspace._id,
        members: [{ user: testUser._id, role: 'admin' }]
      })
      .expect(201);

    expect(response.body.name).toBe('Test Project');
    expect(response.body.workspace.toString()).toBe(testWorkspace._id.toString());
    expect(response.body.members[0].user).toBe(testUser._id.toString());
  });

  test('Create project - unauthorized workspace', async () => {
    // Create another user and workspace
    const otherUser = await User.create({
      email: TEST_EMAIL('other'),
      password: TEST_PASSWORD
    });

    const otherWorkspace = await Workspace.create({
      name: 'Other Workspace',
      owner: otherUser._id,
      members: [{ user: otherUser._id, role: 'admin' }]
    });

    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Test Project',
        workspace: otherWorkspace._id
      })
      .expect(403);
  });

  test('Get project - success', async () => {
    const project = await Project.create({
      name: 'Test Project',
      workspace: testWorkspace._id,
      members: [{ user: testUser._id, role: 'member' }]
    });

    const response = await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.name).toBe('Test Project');
    expect(response.body.workspace).toBeDefined();
    expect(response.body.workspace._id).toBe(testWorkspace._id.toString());
    expect(response.body.workspace.name).toBe(testWorkspace.name);
  });

  test('Get project - unauthorized', async () => {
    // Create another user and workspace
    const otherUser = await User.create({
      email: TEST_EMAIL('other'),
      password: TEST_PASSWORD
    });

    const otherWorkspace = await Workspace.create({
      name: 'Other Workspace',
      owner: otherUser._id,
      members: [{ user: otherUser._id, role: 'admin' }]
    });

    const project = await Project.create({
      name: 'Test Project',
      workspace: otherWorkspace._id,
      members: [{ user: otherUser._id, role: 'member' }]
    });

    await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(403);
  });

  test('Create project - success', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Test Project',
        workspace: testWorkspace._id,
        members: [{ user: testUser._id, role: 'admin' }]
      })
      .expect(201);

    expect(response.body.name).toBe('Test Project');
    expect(response.body.workspace).toBe(testWorkspace._id.toString());
  });

  test('Create project - unauthorized workspace', async () => {
    // Create another workspace the user doesn't belong to
    const otherWorkspace = await Workspace.create({
      name: 'Other Workspace',
      owner: new mongoose.Types.ObjectId() // Different user
    });

    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Test Project',
        workspace: otherWorkspace._id,
        members: [{ user: testUser._id, role: 'admin' }]
      })
      .expect(403);
  });

  test('Get project - success', async () => {
    const project = await Project.create({
      name: 'Test Project',
      workspace: testWorkspace._id,
      members: [{ user: testUser._id, role: 'member' }]
    });

    const response = await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.name).toBe('Test Project');
  });

  test('Get project - unauthorized', async () => {
    const project = await Project.create({
      name: 'Test Project',
      workspace: new mongoose.Types.ObjectId(), // Different workspace
      members: [] // No members
    });

    await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(403);
  });
});
