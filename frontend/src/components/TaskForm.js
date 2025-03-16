import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { taskFormLogger } from '../utils/logger';
import '../styles/TaskForm.css';

const TaskForm = ({ task = defaultTask, onSave, onCancel, token }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  // Reset form when task prop changes
  useEffect(() => {
    taskFormLogger.debug('Task prop changed, resetting form:', task);
    setName(task?.name || '');
    setDescription(task?.description || '');
    setPriority(task?.priority || 'Medium');
    setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().substr(0, 10) : '');
  }, [task]);

  // Clear form when panel opens for new task
  useEffect(() => {
    if (!task) {
      setName('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      name,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };
    
    if (task?._id) {
      taskData._id = task._id;
    }
    
    taskFormLogger.info('Submitting task data:', taskData);
    onSave(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            taskFormLogger.debug('Name changed:', e.target.value);
            setName(e.target.value);
          }}
          required
          aria-label="Name"
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            taskFormLogger.debug('Description changed:', e.target.value);
            setDescription(e.target.value);
          }}
          aria-label="Description"
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => {
            taskFormLogger.debug('Priority changed:', e.target.value);
            setPriority(e.target.value);
          }}
          aria-label="Priority"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => {
            taskFormLogger.debug('Due date changed:', e.target.value);
            setDueDate(e.target.value);
          }}
          aria-label="Due Date"
        />
      </div>
      <button type="submit">Save Task</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

TaskForm.propTypes = {
  task: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    dueDate: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// Use default parameters instead of defaultProps
const defaultTask = {
  name: '',
  description: '',
  priority: 'Medium',
  dueDate: ''
};

export default TaskForm;
