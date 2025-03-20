const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');

const auth = require('../middleware/auth');

// Middleware to check project access
const checkProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.body.project || req.query.project;
    if (!projectId) return next();

    // Check both project membership and workspace membership
    const project = await Project.findOne({
      _id: projectId,
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
    .populate('workspace')
    .populate('members.user');

    if (!project) {
      return res.status(403).json({ error: 'Access to project denied' });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Project access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all tasks for the authenticated user
router.get('/', auth, checkProjectAccess, async (req, res) => {
  try {
    const filter = { owner: req.userId };
    if (req.project) {
      filter.project = req.project._id;
    }

    const tasks = await Task.find(filter).sort({ order: 1, priority: -1, dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update task order
router.patch('/order', async (req, res) => {
  const { orderUpdates } = req.body; // Array of { _id, order } objects
  const bulkOps = orderUpdates.map(update => ({
    updateOne: {
      filter: { _id: update._id },
      update: { order: update.order }
    }
  }));

  try {
    await Task.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    // Check if project ID is provided
    if (!req.body.project) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: req.body.project,
      $or: [
        { 'members.user': req.userId },
        { workspace: { $in: await Workspace.find({
          $or: [
            { owner: req.userId },
            { 'members.user': req.userId }
          ]
        }).select('_id') }}
      ]
    });

    if (!project) {
      return res.status(403).json({ error: 'Access to project denied' });
    }

    // Create the task
    const task = new Task({
      ...req.body,
      owner: req.userId,
      project: project._id
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project').populate('owner');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access
    const hasAccess = await Project.exists({
      _id: task.project,
      $or: [
        { 'members.user': req.userId },
        { workspace: { $in: await Workspace.find({
          $or: [
            { owner: req.userId },
            { 'members.user': req.userId }
          ]
        }).select('_id') }}
      ]
    });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access to task denied' });
    }

    res.json({
      ...task.toObject(),
      project: task.project._id
    });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Update a task by id
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a task by id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
