const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  let user, workspace, project;
  try {
    // Normalize inputs
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email is already in use' });
    }
    console.log('Email is available:', email);
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        error: 'Invalid email format'
      });
    }
    console.log('Email format is valid:', email);
    // Validate required fields
    if (!email || !password) {
      return res.status(400).send({
        error: 'Email and password are required'
      });
    }
    console.log('Email and password are provided');
    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        error: 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character'
      });
    }
    console.log('Password complexity is valid');
    console.log('Creating user with email:', email);
    // Create user
    user = new User({ email, password });
    await user.save();
    console.log('User created:', user.email);
    // Create default workspace
    console.log('Creating default workspace for user:', user.email);
    workspace = new Workspace({
      name: req.body.workspaceName || `${email}'s Workspace`,
      owner: user._id,
      members: [{
        user: user._id,
        role: 'admin'
      }]
    });
    await workspace.save();
    console.log('Workspace created:', workspace.name);
    console.log('Creating default project for workspace:', workspace.name);
    // Create default project
    project = new Project({
      name: req.body.projectName || 'My First Project',
      workspace: workspace._id,
      members: [{
        user: user._id,
        role: 'admin'
      }]
    });
    await project.save();
    console.log('Project created:', project.name);
    console.log('Linking user to workspace and project');
    // Link workspace/project to user
    user.defaultWorkspace = workspace._id;
    user.defaultProject = project._id;
    await user.save();
    console.log('User linked to workspace and project');
    res.status(201).send({
      user: {
        _id: user._id,
        email: user.email
      },
      workspace: {
        _id: workspace._id,
        name: workspace.name
      },
      project: {
        _id: project._id,
        name: project.name
      }
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    // Cleanup if anything fails
    if (user?._id) await User.deleteOne({ _id: user._id });
    if (workspace?._id) await Workspace.deleteOne({ _id: workspace._id });
    if (project?._id) await Project.deleteOne({ _id: project._id });

    res.status(400).send({
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).send({ error: 'Invalid username or password' });
    }
    console.log('User found:', user.email);
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      console.log('Password does not match');
      return res.status(401).send({ error: 'Invalid username or password' });
    }
    console.log('Password matches');
    try {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      console.log('Login successful, token generated');
      res.send({ token });
    } catch (jwtError) {
      console.error('Error generating token:', jwtError);
      res.status(500).send('Error generating token');
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
