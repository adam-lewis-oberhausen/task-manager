import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Button, IconButton } from '@mui/material';
import { Edit, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { getTasks, deleteTask, updateTask, updateTaskOrder } from '../services/taskService';
import TaskForm from './TaskForm';
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

  const updateTaskInList = (id, updatedTask) => {
    const updatedTasks = tasks.map(task => (task._id === id ? { ...task, ...updatedTask } : task));
    setTasks(updatedTasks);
    setEditingTask(null);
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

  const handleCancelEdit = () => {
    setEditingTask(null);
    setAddingTask(false);
    setChangeMessage("");
  };

  const toggleCompletion = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    await updateTask(task._id, updatedTask);
    updateTaskInList(task._id, updatedTask);
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
      {!(addingTask || editingTask) && (
        <Button variant="contained" color="primary" onClick={() => setAddingTask(true)}>Add New Task</Button>
      )}
      {(addingTask || editingTask) && (
        <TaskForm
          addTask={addTask}
          updateTaskInList={updateTaskInList}
          task={editingTask}
          onCancel={handleCancelEdit}
        />
      )}
      <TableContainer component={Paper}>
        <Table className="task-table">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('completed')}>Mark Complete</TableCell>
              <TableCell onClick={() => handleSort('title')}>Title</TableCell>
              <TableCell onClick={() => handleSort('priority')}>Priority</TableCell>
              <TableCell onClick={() => handleSort('dueDate')}>Due Date</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
              <TableCell>Order</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map(task => (
              <TableRow key={task._id} className={isOverdue(task.dueDate) ? 'overdue' : ''}>
                <TableCell><Checkbox checked={task.completed} onChange={() => toggleCompletion(task)} /></TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell className={priorityColors[task.priority]}>{task.priority}</TableCell>
                <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</TableCell>
                <TableCell><IconButton color='primary' onClick={() => startEditing(task)}><Edit /></IconButton></TableCell>
                <TableCell><IconButton color='primary' onClick={() => handleDelete(task)}><Delete /></IconButton></TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOrderChange(task._id, 'up')}><ArrowUpward /></IconButton>
                  <IconButton onClick={() => handleOrderChange(task._id, 'down')}><ArrowDownward /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskList;
