import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { taskFormLogger } from '../utils/logger';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/TaskForm.css';

const TaskForm = ({ task = defaultTask, onSave, onCancel, token, editingTaskId, setEditingName }) => {
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  // Reset form when task prop changes
  useEffect(() => {
    taskFormLogger.debug('Task prop changed, resetting form:', task);
    const newName = task?.name || '';
    setName(newName);
    setDescription(task?.description || '');
    setPriority(task?.priority || 'Medium');
    setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().substr(0, 10) : '');
    
    // If this is the same task being edited inline, sync the name
    if (editingTaskId === task?._id) {
      setEditingName(newName);
    }
  }, [task, editingTaskId, setEditingName]);

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
            const newName = e.target.value;
            taskFormLogger.debug('Name changed:', newName);
            setName(newName);
            // If this is the same task being edited inline, sync the name
            if (editingTaskId === task?._id) {
              setEditingName(newName);
            }
          }}
          required
          aria-label="Name"
        />
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
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <ReactQuill
          id="description"
          value={description}
          onChange={(value) => {
            taskFormLogger.debug('Description changed:', value);
            setDescription(value);
          }}
          modules={{
            toolbar: [
              [{ 'header': [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link', 'image'],
              ['clean']
            ]
          }}
          formats={[
            'header',
            'bold', 'italic', 'underline', 'strike',
            'list', 'bullet',
            'link', 'image'
          ]}
          style={{ 
            height: '200px',
            marginBottom: '40px'
          }}
          aria-label="Description"
        />
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
  editingTaskId: PropTypes.string,
  setEditingName: PropTypes.func
};

// Use default parameters instead of defaultProps
const defaultTask = {
  name: '',
  description: '',
  priority: 'Medium',
  dueDate: ''
};

export default TaskForm;
