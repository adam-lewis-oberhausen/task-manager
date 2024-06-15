import React, { useState, useEffect } from 'react';
import { updateTask } from '../services/taskService';

const EditTask = ({ task, onUpdate, onCancel, onChange }) => {
  const [initialTask, setInitialTask] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority || 'Medium',
    dueDate: task.dueDate ? task.dueDate.substring(0, 10) : ''
  });

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.substring(0, 10) : '');
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority || 'Medium');
    setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');

    setInitialTask({
      title: task.title,
      description: task.description,
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : ''
    });

    setIsModified(false);
  }, [task]);

  const checkIfModified = () => {
    return (
      title !== initialTask.title ||
      description !== initialTask.description ||
      priority !== initialTask.priority ||
      dueDate !== initialTask.dueDate
    );
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    const modified = checkIfModified();
    setIsModified(modified);
    if (modified) {
      onChange(generateChangeMessage());
    }
  };

  const generateChangeMessage = () => {
    const changes = [];
    if (title !== initialTask.title) changes.push(`Title: "${initialTask.title}" -> "${title}"`);
    if (description !== initialTask.description) changes.push(`Description: "${initialTask.description}" -> "${description}"`);
    if (priority !== initialTask.priority) changes.push(`Priority: "${initialTask.priority}" -> "${priority}"`);
    if (dueDate !== initialTask.dueDate) changes.push(`Due Date: "${initialTask.dueDate}" -> "${dueDate}"`);
    return changes.join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedTask = { title, description, priority, dueDate };
    await updateTask(task._id, updatedTask);
    onUpdate(task._id, updatedTask);
    setIsModified(false);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={handleInputChange(setTitle)}
          required
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={handleInputChange(setDescription)}
        />
      </div>
      <div className="form-group">
        <label>Priority</label>
        <select value={priority} onChange={handleInputChange(setPriority)}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div className="form-group">
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={handleInputChange(setDueDate)}
        />
      </div>
      <button type="submit">Update Task</button>
      <button type="button" onClick={() => onCancel(isModified)}>
        Cancel
      </button>
    </form>
  );
};

export default EditTask;
