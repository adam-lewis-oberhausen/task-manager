const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

const auth = require('../middleware/auth');

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Retrieving tasks for user:', req.userId); 
    const tasks = await Task.find({ owner: req.userId }).sort({ order: 1, priority: -1, dueDate: 1 });
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
    console.log('Received task data:', req.body);
    const task = new Task({
      ...req.body,
      owner: req.userId
    });
    
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    console.error('Error saving task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).send({
        error: 'Validation failed',
        details: error.errors
      });
    }
    res.status(500).send('Internal server error');
  }
});

// Read a single task by id
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.userId
    });
    
    if (!task) {
      return res.status(404).send({ error: 'Task not found or access denied' });
    }
    res.send(task);
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
