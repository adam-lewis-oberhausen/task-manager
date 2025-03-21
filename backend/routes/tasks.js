const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const checkProjectAccess = require('../middleware/projectAccess');

// Get all tasks for the authenticated user
router.get('/', auth, checkProjectAccess(), async (req, res) => {
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

router.post('/', auth, checkProjectAccess(), async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({
        error: 'Task name is required'
      });
    }

    // Create the task
    const task = new Task({
      name: req.body.name,
      description: req.body.description || '',
      priority: req.body.priority || 'Medium',
      dueDate: req.body.dueDate || null,
      owner: req.userId,
      project: req.project?._id || null
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Error creating task:', error);
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', auth, checkProjectAccess(), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project').populate('owner');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
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
