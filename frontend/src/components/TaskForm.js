import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/TaskForm.css';

const TaskForm = ({ task, onSave, onCancel, token }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().substr(0, 10) : '');
    } else {
      setName('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
    }
  }, [task]);

  const handleSubmit = (e) => {                                                                                     
    e.preventDefault();                                                                                             
    const taskData = {                                                                                              
      ...task,                                                                                                      
      name,                                                                                                                                                                                              
      description,                                                                                                  
      priority,                                                                                                     
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,                                                                                                       
    };                                                                                                              
    console.log('Submitting task data:', taskData);                                                                 
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
          onChange={(e) => setName(e.target.value)}
          required
          aria-label="Name"
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Description"
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
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
          onChange={(e) => setDueDate(e.target.value)}
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

TaskForm.defaultProps = {
  task: null,
};

export default TaskForm;
