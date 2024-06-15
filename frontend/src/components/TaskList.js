import React, { useEffect, useState } from 'react';
import { getTasks, deleteTask, updateTask, updateTaskOrder } from '../services/taskService';
import TaskForm from './TaskForm';
import EditTask from './EditTask';
import '../styles/App.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [pendingEditTask, setPendingEditTask] = useState(null);
  const [changeMessage, setChangeMessage] = useState("");
  const [sortField, setSortField] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      setTasks(tasks);
    };

    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter(task => task._id !== id));
    if (editingTask && editingTask._id === id) {
      setEditingTask(null);
    }
  };

  const addTask = (task) => {
    setTasks([...tasks, task]);
    setAddingTask(false);
  };

  const startEditing = (task) => {
    if (editingTask && editingTask._id !== task._id) {
      if (changeMessage) {
        const confirmDiscard = window.confirm(`You have unsaved changes:\n${changeMessage}\nDo you really want to discard them?`);
        if (confirmDiscard) {
          setEditingTask(task);
          setPendingEditTask(null);
          setChangeMessage("");
        } else {
          setPendingEditTask(task);
        }
      } else {
        setEditingTask(task);
      }
    } else {
      setEditingTask(task);
    }
  };

  const handleUpdate = (id, updatedTask) => {
    const updatedTasks = tasks.map(task => (task._id === id ? { ...task, ...updatedTask } : task));
    setTasks(updatedTasks);
    setEditingTask(null);
    setPendingEditTask(null);
    setChangeMessage("");
  };

  const handleCancelEdit = (isModified) => {
    if (isModified) {
      const confirmDiscard = window.confirm(`You have unsaved changes:\n${changeMessage}\nDo you really want to discard them?`);
      if (confirmDiscard) {
        setEditingTask(pendingEditTask);
        setPendingEditTask(null);
        setChangeMessage("");
      }
    } else {
      setEditingTask(pendingEditTask);
      setPendingEditTask(null);
      setChangeMessage("");
    }
  };

  const toggleCompletion = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    await updateTask(task._id, updatedTask);
    handleUpdate(task._id, updatedTask);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const priorityColors = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low',
  };

  const handleSort = (field) => {
    const order = (sortField === field && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
    const sortedTasks = [...tasks].sort((a, b) => {
      if (order === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setTasks(sortedTasks);
  };

  const handleOrderChange = (taskId, direction) => {
    const index = tasks.findIndex(task => task._id === taskId);
    if (index < 0) return;

    const newOrder = [...tasks];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else if (direction === 'down' && index < tasks.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }

    newOrder.forEach((task, idx) => task.order = idx);
    setTasks(newOrder);
    updateTaskOrder(newOrder.map(task => ({ _id: task._id, order: task.order })));
  };

  return (
    <div className="container">
      <h1>Task List</h1>
      <button onClick={() => setAddingTask(!addingTask)}>Add New Task</button>
      {addingTask && <TaskForm addTask={addTask} />}
      {editingTask && (
        <EditTask
          task={editingTask}
          onUpdate={handleUpdate}
          onCancel={handleCancelEdit}
          onChange={setChangeMessage}
        />
      )}
      <table className="task-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('completed')}>Mark Complete</th>
            <th onClick={() => handleSort('title')}>Title</th>
            <th onClick={() => handleSort('description')}>Description</th>
            <th onClick={() => handleSort('priority')}>Priority</th>
            <th onClick={() => handleSort('dueDate')}>Due Date</th>
            <th>Edit</th>
            <th>Delete</th>
            <th>Order</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task._id} className={isOverdue(task.dueDate) ? 'overdue' : ''}>
              <td><input type="checkbox" checked={task.completed} onChange={() => toggleCompletion(task)} /></td>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td className={priorityColors[task.priority]}>{task.priority}</td>
              <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</td>
              <td><button className="btn edit-btn" onClick={() => startEditing(task)}>Edit</button></td>
              <td><button className="btn delete-btn" onClick={() => handleDelete(task._id)}>Delete</button></td>
              <td>
                <button className="btn up-btn" onClick={() => handleOrderChange(task._id, 'up')}>↑</button>
                <button className="btn down-btn" onClick={() => handleOrderChange(task._id, 'down')}>↓</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
