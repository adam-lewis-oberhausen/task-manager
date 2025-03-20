const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { app } = require('../index');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// Define test constants
const TEST_PASSWORD = 'ValidPass123!';
const TEST_EMAIL = (suffix) => `_____test_projects_email_${suffix}@example.com`;
const TEST_WORKSPACE = (suffix) => `_____test_projects_workspace_${suffix}`;
const TEST_PROJECT = (suffix) => `_____test_projects_project_${suffix}`;

describe('Project API', () => {
  let testUser, testWorkspace, testToken, testProject;

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
      name: TEST_WORKSPACE(Date.now()),
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });

    // Create a test project
    testProject = new Project({
      name: TEST_PROJECT(Date.now()),
      workspace: testWorkspace._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });
    await testProject.save();

    // Generate token
    testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
  });

  afterEach(async () => {
    await Project.deleteMany({ name: /^_____test_projects/ });
    await Workspace.deleteMany({ name: /^_____test_projects/ });
    await User.deleteMany({ email: /^_____test_projects/ });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Create project - success', async () => {
    const projectName = TEST_PROJECT(Date.now());
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: projectName,
        workspace: testWorkspace._id,
        members: [{ user: testUser._id, role: 'admin' }]
      })
      .expect(201);

    expect(response.body.name).toBe(projectName);
    expect(response.body.workspace.toString()).toBe(testWorkspace._id.toString());
    expect(response.body.members[0].user).toBe(testUser._id.toString());
  });

  test('Create project - unauthorized workspace', async () => {
    // Create another user and workspace
    const otherUser = await User.create({
      email: TEST_EMAIL(Date.now()),
      password: TEST_PASSWORD
    });

    const otherWorkspace = await Workspace.create({
      name: TEST_WORKSPACE(Date.now()),
      owner: otherUser._id,
      members: [{ user: otherUser._id, role: 'admin' }]
    });

    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: TEST_PROJECT(Date.now()),
        workspace: otherWorkspace._id
      })
      .expect(403);
  });

  test('Get project - success', async () => {
    const project = await Project.create({
      name: testProject.name,
      workspace: testWorkspace._id,
      members: [{ user: testUser._id, role: 'member' }]
    });

    const response = await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.name).toBe(testProject.name);
    expect(response.body.workspace).toBeDefined();
    expect(response.body.workspace._id).toBe(testWorkspace._id.toString());
    expect(response.body.workspace.name).toBe(testWorkspace.name);
  });

  test('Get project - unauthorized', async () => {
    // Create another user, workspace and project
    const otherUser = await User.create({
      email: TEST_EMAIL('other'),
      password: TEST_PASSWORD
    });

    const otherWorkspace = await Workspace.create({
      name: TEST_WORKSPACE('other'),
      owner: otherUser._id,
      members: [{ user: otherUser._id, role: 'admin' }]
    });

    const project = await Project.create({
      name: TEST_PROJECT('other'),
      workspace: otherWorkspace._id,
      members: [{ user: otherUser._id, role: 'member' }]
    });

    await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(403);
  });

  test('Create project - success', async () => {
    const projectName = TEST_PROJECT(Date.now());
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: projectName,
        workspace: testWorkspace._id,
        members: [{ user: testUser._id, role: 'admin' }]
      })
      .expect(201);

    expect(response.body.name).toBe(projectName);
    expect(response.body.workspace).toBe(testWorkspace._id.toString());
  });

  test('Create project - unauthorized workspace', async () => {
    // Create another workspace the user doesn't belong to
    const otherWorkspace = await Workspace.create({
      name: TEST_WORKSPACE(Date.now()),
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
    const projectName = TEST_PROJECT(Date.now());
    const project = await Project.create({
      name: projectName,
      workspace: testWorkspace._id,
      members: [{ user: testUser._id, role: 'member' }]
    });

    const response = await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.name).toBe(projectName);
  });

  test('Get project - unauthorized', async () => {
    const project = await Project.create({
      name: TEST_PROJECT(Date.now()),
      workspace: new mongoose.Types.ObjectId(), // Different workspace
      members: [] // No members
    });

    await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(403);
  });
});
