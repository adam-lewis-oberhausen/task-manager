const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../index');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');

// Test constants
const TEST_PASSWORD = 'ValidPass123!';
const INVALID_PASSWORD = 'weak';
const TEST_EMAIL = (suffix) => `_____test_auth_email_${suffix}@example.com`;
const TEST_WORKSPACE = (suffix) => `_____test_auth_workspace_${suffix}`;
const TEST_PROJECT = (suffix) => `_____test_auth_project_${suffix}`;

let testServer;

beforeAll(async () => {
  // Start test server on a random available port
  testServer = app.listen(0);
  process.env.TEST_PORT = testServer.address().port;

  // Connect to the test database
  const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({ email: /^_____test_auth/ });
  await Workspace.deleteMany({ name: /^_____test_auth/ });
  await Project.deleteMany({ name: /^_____test_auth/ });

  // Close connections
  await mongoose.connection.close();
  testServer.close();
});

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    // Clean up all test data
    await User.deleteMany({ email: /^_____test_auth/ });
    await Workspace.deleteMany({ name: /^_____test_auth/ });
    await Project.deleteMany({ name: /^_____test_auth/ });
  });

  describe('Registration', () => {
    it('should create default workspace and project', async () => {
      const email = TEST_EMAIL(Date.now());
      const workspaceName = TEST_WORKSPACE(Date.now());
      const projectName = TEST_PROJECT(Date.now());
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: TEST_PASSWORD,
          workspaceName: workspaceName,
          projectName: projectName
        })
        .expect(201);

      // Verify response
      expect(res.body.user.email).toBe(email);
      expect(res.body.workspace.name).toBe(workspaceName);
      expect(res.body.project.name).toBe(projectName);

      // Verify database state
      const user = await User.findById(res.body.user._id);
      const workspace = await Workspace.findById(res.body.workspace._id);
      const project = await Project.findById(res.body.project._id);

      expect(user.defaultWorkspace.toString()).toBe(workspace._id.toString());
      expect(user.defaultProject.toString()).toBe(project._id.toString());
      expect(workspace.owner.toString()).toBe(user._id.toString());
      expect(project.workspace.toString()).toBe(workspace._id.toString());

      // Cleanup
      await User.deleteOne({ _id: user._id });
      await Workspace.deleteOne({ _id: workspace._id });
      await Project.deleteOne({ _id: project._id });
    });

    it('should use provided workspace and project names', async () => {
      const email = TEST_EMAIL(Date.now());
      const workspaceName = TEST_WORKSPACE(Date.now());
      const projectName = TEST_PROJECT(Date.now());
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: TEST_PASSWORD,
          workspaceName: workspaceName,
          projectName: projectName
        })
        .expect(201);

      expect(res.body.workspace.name).toBe(workspaceName);
      expect(res.body.project.name).toBe(projectName);

      // Cleanup
      await User.deleteOne({ _id: res.body.user._id });
      await Workspace.deleteOne({ _id: res.body.workspace._id });
      await Project.deleteOne({ _id: res.body.project._id });
    });

    it('should clean up on failure', async () => {
      // Mock Project.save to fail
      const originalSave = Project.prototype.save;
      Project.prototype.save = jest.fn().mockRejectedValue(new Error('Project creation failed'));

      const email = TEST_EMAIL(Date.now());
      const workspaceName = TEST_WORKSPACE(Date.now());
      const projectName = TEST_PROJECT(Date.now());
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: TEST_PASSWORD,
          workspaceName: workspaceName,
          projectName: projectName
        })
        .expect(400);

      expect(res.body.error).toBe('Registration failed');

      // Verify cleanup
      const user = await User.findOne({ email });
      const workspaces = await Workspace.find({ owner: user?._id });
      const projects = await Project.find({ workspace: workspaces.map(ws => ws._id) });
      expect(user).toBeNull();
      expect(workspaces.length).toBe(0);
      expect(projects.length).toBe(0);

      // Restore original save
      Project.prototype.save = originalSave;
    });
    it('should register a new user with valid credentials', async () => {
      const email = TEST_EMAIL(Date.now());
      const workspaceName = TEST_WORKSPACE(Date.now());
      const projectName = TEST_PROJECT(Date.now());
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: email,
          password: TEST_PASSWORD,
          workspaceName: workspaceName,
          projectName: projectName
        })
      expect(res.statusCode).toEqual(201);

      // Verify the response structure
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', email);
      expect(res.body).toHaveProperty('workspace');
      expect(res.body.workspace).toHaveProperty('name', workspaceName);
      expect(res.body).toHaveProperty('project');
      expect(res.body.project).toHaveProperty('name', projectName);
    });

    it('should fail to register with invalid password', async () => {
      const email = TEST_EMAIL(Date.now());
      const workspaceName = TEST_WORKSPACE(Date.now());
      const projectName = TEST_PROJECT(Date.now());
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: email,
          password: INVALID_PASSWORD,
          workspaceName: workspaceName,
          projectName: projectName
        })
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toMatch(/Password must be at least 8 characters long/);
    });

    it('should fail to register with duplicate email', async () => {
      const email = TEST_EMAIL(Date.now());
      const workspaceName = TEST_WORKSPACE(Date.now());
      const projectName = TEST_PROJECT(Date.now());

      // Create initial user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: email,
          password: TEST_PASSWORD,
          workspaceName: workspaceName,
          projectName: projectName
        })

      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: email,
          password: TEST_PASSWORD,
          workspaceName: workspaceName,
          projectName: projectName
        })
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toMatch(/Email is already in use/);
    });

    it('should fail to register with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: TEST_PASSWORD,
          workspaceName: TEST_WORKSPACE(Date.now()),
          projectName: TEST_PROJECT(Date.now())
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/Invalid email format/);
    });

    it('should fail to register with empty fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: '',
          password: '',
          workspaceName: '',
          projectName: ''
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/Invalid email format/);
    });

    it('should reject test account registration without explicit workspace/project names', async () => {
      const email = TEST_EMAIL(Date.now());
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: email,
          password: TEST_PASSWORD
        })
        .expect(400);

      expect(res.body.error).toBe('Test accounts require explicit workspace and project names');
    });

    it('should allow test account registration with explicit workspace/project names', async () => {
      const email = TEST_EMAIL(Date.now());
      const workspaceName = TEST_WORKSPACE(Date.now());
      const projectName = TEST_PROJECT(Date.now());
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: email,
          password: TEST_PASSWORD,
          workspaceName: workspaceName,
          projectName: projectName
        })
        .expect(201);

      expect(res.body.user.email).toBe(email);
      expect(res.body.workspace.name).toBe(workspaceName);
      expect(res.body.project.name).toBe(projectName);
    }); 
  });

  describe('Login', () => {
    beforeEach(async () => {
      // Create a test user with properly hashed password
      const userName = TEST_EMAIL('login');
      const user = new User({
        email: userName,
        password: TEST_PASSWORD
      });
      await user.save();

      // Verify the user was created with hashed password
      const createdUser = await User.findOne({ email: userName });
      expect(createdUser).toBeTruthy();
      expect(createdUser.password).not.toBe(TEST_PASSWORD); // Should be hashed
    });

    it('should login with valid credentials', async () => {
      // Verify test user exists
      const testUser = await User.findOne({ email: TEST_EMAIL('login') });
      expect(testUser).toBeTruthy();

      // Verify password is properly hashed
      const isPasswordValid = await testUser.comparePassword(TEST_PASSWORD);
      expect(isPasswordValid).toBe(true);

      // Attempt login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL('login'),
          password: TEST_PASSWORD,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail to login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL('login'),
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/Invalid username or password/);
    });

    it('should fail to login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: TEST_PASSWORD,
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toMatch(/Invalid username or password/);
    });
  });
});
