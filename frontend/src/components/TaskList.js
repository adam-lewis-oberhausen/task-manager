import React, { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import TaskRow from './TaskRow';
import { getTasks, deleteTask, updateTask, updateTaskOrder, createTask } from '../services/taskService';
import TaskForm from './TaskForm';
import '../styles/TaskList.css';

import { ItemType } from '../constants/dndTypes';

const TaskList = ({ token }) => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);                                                                           
  const [editingName, setEditingName] = useState('');

  const MOCK_TASKS = [
    { _id: 'mock-1', name: 'e.g Determine project goal' },
    { _id: 'mock-2', name: 'e.g Schedule kickoff meeting' },
    { _id: 'mock-3', name: 'e.g. Set final deadline' }
  ];

  const loadMockTasks = () => {
    setTasks([...MOCK_TASKS]);
  };

  useEffect(() => {
    const fetchTasks = async (token) => {
      try {
        console.log('Attempting to fetch tasks with token:', token); 
        const tasks = await getTasks(token);
        console.log('Tasks retrieved:', tasks);
        if (tasks.length === 0) {
          loadMockTasks();
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
      const updatedTasks = tasks.filter(task => task._id !== id);
      
      // If we deleted the last real task, reload mock tasks
      if (updatedTasks.length === 0 && tasks.some(t => !t._id.startsWith('mock-'))) {
        loadMockTasks();
      } else {
        setTasks(updatedTasks);
      }

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

  const handleNameUpdate = async () => {                                                                                              
    if (!editingTaskId) return;                                                                                                       
                                                                                                                                      
    // If it's a mock task and name is empty, reload mock tasks                                                                       
    if (editingTaskId.startsWith('mock-') && !editingName.trim()) {                                                                   
      loadMockTasks();
      setEditingTaskId(null);                                                                                                         
      setEditingName('');                                                                                                             
      return;                                                                                                                         
    }                                                                                                                                 
                                                                                                                                      
    // If it's a mock task and has content, remove other mock tasks                                                                   
    if (editingTaskId.startsWith('mock-') && editingName.trim()) {                                                                    
      const updatedTasks = tasks.filter(t => !t._id.startsWith('mock-'));                                                             
      try {                                                                                                                           
        const newTask = await createTask({ name: editingName }, token);                                                               
        setTasks([...updatedTasks, newTask]);                                                                                         
      } catch (error) {                                                                                                               
        console.error('Error creating task:', error);                                                                                 
      }                                                                                                                               
      setEditingTaskId(null);                                                                                                         
      setEditingName('');                                                                                                             
      return;                                                                                                                         
    }                                                                                                                                 
                                                                                                                                      
    // Handle regular task updates                                                                                                    
    if (editingName.trim()) {                                                                                                         
      try {                                                                                                                           
        const updatedTask = await updateTask(editingTaskId, { name: editingName }, token);                                            
        setTasks(tasks.map(t =>                                                                                                       
          t._id === editingTaskId ? { ...t, name: editingName } : t                                                                   
        ));                                                                                                                           
      } catch (error) {                                                                                                               
        console.error('Error updating task name:', error);                                                                            
      }                                                                                                                               
    }                                                                                                                                 
    setEditingTaskId(null);                                                                                                           
    setEditingName('');                                                                                                               
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


  const toggleCompletion = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(task._id, updatedTask);
      setTasks(tasks.map(t => (t._id === task._id ? updatedTask : t)));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const areAllTasksMock = () => {                                                                                                     
    return tasks.length > 0 && tasks.every(t => t._id.startsWith('mock-'));                                                           
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
    <div className="task-list-container">                                                                                           
      <Button variant="contained" color="primary" onClick={toggleTaskPanel} className="add-task-button"> 
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
              <TaskRow
                key={task._id}
                task={task}
                index={index}
                editingTaskId={editingTaskId}
                setEditingTaskId={setEditingTaskId}
                editingName={editingName}
                setEditingName={setEditingName}
                handleNameUpdate={handleNameUpdate}
                toggleCompletion={toggleCompletion}
                startEditing={startEditing}
                handleDelete={handleDelete}
                moveTask={moveTask}
                isOverdue={isOverdue}
                priorityColors={priorityColors}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskList;
