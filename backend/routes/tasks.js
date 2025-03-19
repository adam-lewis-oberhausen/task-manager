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
    });

    if (!project) {
      return res.status(403).json({ error: 'Access to project denied' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
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

router.post('/', auth, checkProjectAccess, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.userId,
      project: req.project._id
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Expected validation error - don't log as error
      console.log('Task validation failed:', error.errors);
      return res.status(400).send({
        error: 'Validation failed',
        details: error.errors
      });
    }
    // Unexpected error - log as error
    console.error('Unexpected error saving task:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Read a single task by id
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.userId
    }).populate('project');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    
    // Verify project access
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
    
    res.json(task);
  } catch (error) {
    res.status(500).send(error);
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
