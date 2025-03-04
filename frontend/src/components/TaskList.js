import React, { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, IconButton, Button } from '@mui/material';
import { Edit, Delete, DragHandle } from '@mui/icons-material';
import { getTasks, deleteTask, updateTask, updateTaskOrder, createTask } from '../services/taskService';
import TaskForm from './TaskForm';
import '../styles/App.css';

const ItemType = 'TASK';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await getTasks();
        setTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
      if (editingTask && editingTask._id === id) {
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSave = async (task) => {
    try {
      if (task._id) {
        // Update existing task
        await updateTask(task._id, task);
        setTasks(tasks.map(t => (t._id === task._id ? task : t)));
      } else {
        // Add new task
        const newTask = await createTask(task);
        setTasks([...tasks, newTask]);
      }
      setAddingTask(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleCancel = () => {
    setAddingTask(false);
    setEditingTask(null);
  };

  const moveTask = (dragIndex, hoverIndex) => {
    const draggedTask = tasks[dragIndex];
    const updatedTasks = [...tasks];
    updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);
    setTasks(updatedTasks);
    updateTaskOrder(updatedTasks.map((task, index) => ({ _id: task._id, order: index })));
  };

  const startEditing = (task) => {
    setEditingTask(task);
  };

  const TaskRow = ({ task, index }) => {
    const [, ref] = useDrag({
      type: ItemType,
      item: { index },
    });

    const [, drop] = useDrop({
      accept: ItemType,
      hover: (draggedItem) => {
        if (draggedItem.index !== index) {
          moveTask(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    });

    return (
      <TableRow ref={(node) => ref(drop(node))} className={isOverdue(task.dueDate) ? 'overdue' : ''}>
        <TableCell>
          <div>
            <DragHandle />
          </div>
        </TableCell>
        <TableCell>
          <Checkbox checked={task.completed} onChange={() => toggleCompletion(task)} />
        </TableCell>
        <TableCell>{task.title}</TableCell>
        <TableCell className={priorityColors[task.priority]}>{task.priority}</TableCell>
        <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</TableCell>
        <TableCell>
          <IconButton color="primary" onClick={() => startEditing(task)}>
            <Edit />
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton color="secondary" onClick={() => handleDelete(task._id)}>
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  const toggleCompletion = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(task._id, updatedTask);
      setTasks(tasks.map(t => (t._id === task._id ? updatedTask : t)));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
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

  return (
    <div className="container">
      <h1>Task List</h1>
      {addingTask && (
        <TaskForm
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      <Button variant="contained" color="primary" onClick={() => setAddingTask(true)}>Add New Task</Button>
      <TableContainer component={Paper}>
        <Table className="task-table">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Complete</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, index) => (
              <TaskRow key={task._id} task={task} index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskList;
