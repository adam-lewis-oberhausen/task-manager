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

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        error: 'Invalid email format'
      });
    }

    // Validate required fields
    if (!email || !password) {
      return res.status(400).send({
        error: 'Email and password are required'
      });
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        error: 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character'
      });
    }

    // Create user
    user = new User({ email, password });
    await user.save();

    // Create default workspace
    workspace = new Workspace({
      name: req.body.workspaceName || 'Default Workspace',
      owner: user._id,
      members: [{
        user: user._id,
        role: 'admin'
      }]
    });
    await workspace.save();

    // Create default project
    project = new Project({
      name: req.body.projectName || 'Default Project',
      workspace: workspace._id,
      members: [{
        user: user._id,
        role: 'admin'
      }]
    });
    await project.save();

    // Link workspace/project to user
    user.defaultWorkspace = workspace._id;
    user.defaultProject = project._id;
    await user.save();

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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }

    try {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.send({ token });
    } catch (jwtError) {
      res.status(500).send('Error generating token');
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;