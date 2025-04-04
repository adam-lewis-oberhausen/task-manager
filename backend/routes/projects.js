const express = require('express');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const Task = require('../models/Task');

const router = express.Router();

 // Error handling middleware for projects
 router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Projects API error' });
});

// Create a new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, workspace } = req.body;

    // Verify workspace exists and user has access
    const workspaceDoc = await Workspace.findOne({
      _id: workspace
    });

    if (!workspaceDoc) {
      return res.status(404).json({
        error: 'Workspace not found'
      });
    }

    // Check if user is workspace owner or member
    const isOwner = workspaceDoc.owner.equals(req.userId);
    const isMember = workspaceDoc.members.some(m => m.user.equals(req.userId));

    if (!isOwner && !isMember) {
      return res.status(403).json({
        error: 'Not authorized to create projects in this workspace'
      });
    }

    const project = new Project({
      name,
      workspace,
      members: [{
        user: req.userId,
        role: 'admin'
      }]
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all projects for a workspace
router.get('/', auth, async (req, res) => {
  try {
    const workspaceId = req.query.workspace;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }

    // Verify workspace exists and user has access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    });

    if (!workspace) {
      return res.status(403).json({ error: 'Workspace not found or access denied' });
    }

    // Get projects for the workspace
    const projects = await Project.find({
      workspace: workspaceId,
      $or: [
        { 'members.user': req.userId },
        { workspace: { $in: await Workspace.find({
          $or: [
            { owner: req.userId },
            { 'members.user': req.userId }
          ]
        }).select('_id') }}
      ]
    })
    .populate({
      path: 'workspace',
      select: '_id name'
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project details
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { 'members.user': req.userId },
        { workspace: { $in: await Workspace.find({
          $or: [
            { owner: req.userId },
            { 'members.user': req.userId }
          ]
        }).select('_id') }}
      ]
    })
    .populate({
      path: 'workspace',
      select: '_id name'
    });

    if (!project) {
      return res.status(403).json({ error: 'Project not found or access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.patch('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        'members.user': req.userId,
        'members.role': 'admin'
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found or insufficient permissions' });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      'members.user': req.userId,
      'members.role': 'admin'
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or insufficient permissions' });
    }

    // Delete associated tasks
    await Task.deleteMany({ project: project._id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
