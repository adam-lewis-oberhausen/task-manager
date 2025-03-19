const express = require('express');
const auth = require('../middleware/auth');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

const router = express.Router();

// Create a new workspace
router.post('/', auth, async (req, res) => {
  try {
    const workspace = new Workspace({
      name: req.body.name,
      owner: req.userId,
      members: [{
        user: req.userId,
        role: 'admin'
      }]
    });
    await workspace.save();
    res.status(201).send(workspace);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all workspaces for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    });
    res.send(workspaces);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a single workspace by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    }, null, { lean: true })
    .populate({
      path: 'owner',
      select: '_id email'
    })
    .populate({
      path: 'members.user',
      select: '_id email'
    });
    
    if (!workspace) {
      return res.status(404).send();
    }
    res.send(workspace);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a workspace
router.patch('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.userId // Only owner can update
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!workspace) {
      return res.status(404).send();
    }
    res.send(workspace);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a workspace
router.delete('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId // Only owner can delete
    });
    
    if (!workspace) {
      return res.status(404).send();
    }
    res.send(workspace);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
