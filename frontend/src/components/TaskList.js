import React, { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, IconButton, Button } from '@mui/material';
import { Edit, Delete, DragHandle } from '@mui/icons-material';
import { getTasks, deleteTask, updateTask, updateTaskOrder, createTask } from '../services/taskService';
import TaskForm from './TaskForm';
import './TaskList.css';

const ItemType = 'TASK';

const TaskList = ({ onLogout, token }) => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async (token) => {
      try {
        console.log('Attempting to fetch tasks with token:', token); 
        const tasks = await getTasks(token);
        console.log('Tasks retrieved:', tasks);
        if (tasks.length === 0) {
          setTasks([
            { _id: '1', name: 'Mock Task 1' },
            { _id: '2', name: 'Mock Task 2' },
            { _id: '3', name: 'Mock Task 3' },
          ]);
        } else {
          setTasks(tasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks(token);
  }, [token]);

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

  const toggleTaskPanel = () => {
    setTaskPanelOpen(!taskPanelOpen);
  };

  const handleSave = async (task) => {
    try {
      if (task._id) {
        // Update existing task
        await updateTask(task._id, task, token);
        setTasks(tasks.map(t => (t._id === task._id ? task : t)));
      } else {
        // Add new task
        const newTask = await createTask(task, token);
        setTasks([...tasks, newTask]);
      }
      setTaskPanelOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleCancel = () => {
    setTaskPanelOpen(false);
    setEditingTask(null);
  };

  const moveTask = (dragIndex, hoverIndex) => {
    const draggedTask = tasks[dragIndex];
    console.log(`Moving task from index ${dragIndex} to ${hoverIndex}`);
    const updatedTasks = [...tasks];
    updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);
    setTasks(updatedTasks);
    updateTaskOrder(updatedTasks.map((task, index) => ({ _id: task._id, order: index })))
      .then(() => console.log('Task order updated successfully'))
      .catch(error => console.error('Error updating task order:', error));
  };

  const startEditing = (task) => {
    setEditingTask(task);
  };

  const TaskRow = ({ task, index }) => {
    const [{ isDragging }, ref] = useDrag({
      type: ItemType,
      item: { index },
    }, [index, moveTask]);

    const [{ isOver }, drop] = useDrop({
      accept: ItemType,
      hover: (draggedItem) => {
        console.log(`Dragging item from index ${draggedItem.index} to ${index}`);
        if (draggedItem.index !== index) {
          moveTask(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    }, [index, moveTask]);

    // console.log(`Rendering TaskRow for task: ${task.name}, index: ${index}`);
    const [showHandle, setShowHandle] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
      <TableRow
        ref={(node) => ref(drop(node))}
        className={`${isOverdue(task.dueDate) ? 'overdue' : ''} ${task.completed ? 'completed' : ''}`}
        onMouseEnter={() => setShowHandle(true)}
        onMouseLeave={() => setShowHandle(false)}
      >
        <TableCell style={{ border: 'none' }}>
          <DragHandle />
        </TableCell>
        <TableCell>
          <Checkbox checked={task.completed} onChange={() => toggleCompletion(task)} />
        </TableCell>
        <TableCell>{task.assignee}</TableCell>
        <TableCell
          onMouseEnter={() => setIsHovered(true)}                                                                                             
          onMouseLeave={() => setIsHovered(false)}                                                                                            
          style={{                                                                                                                            
            border: isHovered ? '2px solid #1976d2' : '1px solid rgba(224, 224, 224, 1)',                                                                                 
            transition: 'border 0.2s ease',                                                                                                   
            cursor: 'pointer'                                                                                                                 
          }}
        > 
          {task.name}
        </TableCell>
        <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</TableCell>
        <TableCell className={priorityColors[task.priority]}>{task.priority}</TableCell>
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

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="container">
      <Button variant="contained" color="primary" onClick={toggleTaskPanel} style={{ margin: '10px 0' }}>
        Add Task
      </Button>

      <div className={`task-panel ${taskPanelOpen ? 'open' : ''}`}>
        <TaskForm onSave={handleSave} onCancel={handleCancel} token={token}/>
      </div>
      {editingTask && (
        <TaskForm
          task={editingTask}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      <TableContainer component={Paper}>
        <Table className="task-table">
          <TableHead>
            <TableRow>
              <TableCell style={{ border: 'none' }}></TableCell>
              <TableCell>Complete</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Priority</TableCell>
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
