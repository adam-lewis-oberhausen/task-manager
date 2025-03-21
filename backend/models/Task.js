const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    minlength: [1, 'Task name must be at least 1 character'],
    maxlength: [100, 'Task name cannot exceed 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task owner is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  description: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: {
      values: ['High', 'Medium', 'Low'],
      message: 'Priority must be High, Medium, or Low'
    },
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    // validate: {
    //   validator: function(v) {
    //     return !v || v > Date.now();
    //   },
    //   message: 'Due date must be in the future'
    // }
  },
  completed: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
taskSchema.index({ project: 1 });
taskSchema.index({ owner: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ completed: 1 });

module.exports = mongoose.model('Task', taskSchema);
