const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { app } = require('../index');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');

// Define test constants
const TEST_PASSWORD = 'ValidPass123!';
const TEST_EMAIL = (suffix) => `test_workspaces_email_${suffix}@example.com`;
const TEST_WORKSPACE = (suffix) => `test_workspaces_workspace_${suffix}`;

let testServer;
let testToken;
let testUser;

beforeAll(async () => {
  // Start test server on a random available port
  testServer = app.listen(0);
  process.env.TEST_PORT = testServer.address().port;

  // Connect to the test database
  const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Create a unique test user for each test
  const uniqueEmail = TEST_EMAIL(Date.now());
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  testUser = new User({
    email: uniqueEmail,
    password: hashedPassword
  });
  await testUser.save();

  // Generate a JWT token
  testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
});

afterEach(async () => {
  // Clean up test data after each test
  await User.deleteMany({ email: /^test_workspaces/ });
  await Workspace.deleteMany({ name: /^test_workspaces/ });
});

afterAll(async () => {
  // Close connections
  await mongoose.connection.close();
  testServer.close();
});

describe('Workspace API', () => {
  test('Create a new workspace', async () => {
    const workspaceName = TEST_WORKSPACE(Date.now());
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
    const workspaceName = TEST_WORKSPACE(Date.now());
    const workspace = await Workspace.create({
      name: workspaceName,
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });

    // Verify workspace was created
    const foundWorkspace = await Workspace.findById(workspace._id);
    if (!foundWorkspace) {
      throw new Error('Workspace not found in database');
    }

    const response = await request(app)
      .get('/api/workspaces')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe(workspaceName);
  });

  test('Get single workspace', async () => {
    const workspaceName = TEST_WORKSPACE(Date.now());
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
    const workspaceName = TEST_WORKSPACE(Date.now());
    const workspace = new Workspace({
      name: workspaceName,
      owner: testUser._id,
      members: [{ user: testUser._id, role: 'admin' }]
    });
    await workspace.save();

    const response = await request(app)
      .patch(`/api/workspaces/${workspace._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: workspaceName + '_updated' })
      .expect(200);

    expect(response.body.name).toBe(workspaceName + '_updated');
  });

  test('Delete workspace', async () => {
    const workspace = new Workspace({
      name: TEST_WORKSPACE(Date.now()),
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
