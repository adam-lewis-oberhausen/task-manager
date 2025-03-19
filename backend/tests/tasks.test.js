const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { app } = require('../index');
const User = require('../models/User');
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');

// Test constants
const TEST_PASSWORD = 'ValidPass123!';
const TEST_EMAIL = (suffix) => `test${suffix}@example.com`;

let testServer;
let testToken;
let testUser;
let testWorkspace;
let testProject;

beforeAll(async () => {
  // Start test server on a random available port
  testServer = app.listen(0);
  process.env.TEST_PORT = testServer.address().port;

  // Connect to the test database
  const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
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

  // Create a test workspace
  testWorkspace = new Workspace({
    name: 'Test Workspace',
    owner: testUser._id,
    members: [{ user: testUser._id, role: 'admin' }]
  });
  await testWorkspace.save();

  // Create a test project
  testProject = new Project({
    name: 'Test Project',
    workspace: testWorkspace._id,
    members: [{ user: testUser._id, role: 'admin' }]
  });
  await testProject.save();

  // Generate a JWT token
  testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
});

afterEach(async () => {
  // Clean up test data after each test
  await User.deleteMany({});
  await Task.deleteMany({});
});

afterAll(async () => {
  // Close connections
  await mongoose.connection.close();
  testServer.close();
});

describe('Task API', () => {
  test('Create a new task', async () => {
    const taskData = {
      name: 'Test Task',
      description: 'Test Description',
      priority: 'Medium',
      dueDate: new Date().toISOString(),
      project: testProject._id
    };

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${testToken}`)
      .send(taskData)
      .expect(201);

    expect(response.body.name).toBe(taskData.name);
    expect(response.body.description).toBe(taskData.description);
    expect(response.body.project).toBe(testProject._id.toString());
    expect(response.body.owner).toBe(testUser._id.toString());
  });

  test('Fail to create task with invalid data', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${testToken}`)
      .send({}) // Empty data
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('Get all tasks for user', async () => {
    // Create test tasks
    const task1 = new Task({
      name: 'Task 1',
      owner: testUser._id,
      project: testProject._id,
      description: 'Description 1',
      priority: 'Medium'
    });
    const task2 = new Task({
      name: 'Task 2',
      owner: testUser._id,
      project: testProject._id,
      description: 'Description 2',
      priority: 'High'
    });
    await Promise.all([task1.save(), task2.save()]);

    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.length).toBe(2);
    expect(response.body[0].project).toBe(testProject._id.toString());
    expect(response.body[1].project).toBe(testProject._id.toString());
  });

  test('Get single task', async () => {
    const task = new Task({
      name: 'Test Task',
      owner: testUser._id,
      project: testProject._id
    });
    await task.save();

    const response = await request(app)
      .get(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.name).toBe('Test Task');
    expect(response.body.project).toBe(testProject._id.toString());
  });

  test('Update task', async () => {
    const task = new Task({
      name: 'Original Task',
      owner: testUser._id,
      project: testProject._id
    });
    await task.save();

    const response = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Updated Task' })
      .expect(200);

    expect(response.body.name).toBe('Updated Task');
    expect(response.body.project).toBe(testProject._id.toString());
  });

  test('Delete task', async () => {
    const task = new Task({
      name: 'Task to Delete',
      owner: testUser._id,
      project: testProject._id
    });
    await task.save();

    await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    // Verify deletion
    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });

  test('Fail to access other user\'s task', async () => {
    // Create another user
    const otherUser = new User({
      email: TEST_EMAIL('other'),
      password: await bcrypt.hash(TEST_PASSWORD, 10)
    });
    await otherUser.save();

    // Create another workspace and project
    const otherWorkspace = new Workspace({
      name: 'Other Workspace',
      owner: otherUser._id,
      members: [{ user: otherUser._id, role: 'admin' }]
    });
    await otherWorkspace.save();

    const otherProject = new Project({
      name: 'Other Project',
      workspace: otherWorkspace._id,
      members: [{ user: otherUser._id, role: 'admin' }]
    });
    await otherProject.save();

    // Create task for other user
    const task = new Task({
      name: 'Other User Task',
      owner: otherUser._id,
      project: otherProject._id
    });
    await task.save();

    // Try to access with test user
    const response = await request(app)
      .get(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error');
  });
});
