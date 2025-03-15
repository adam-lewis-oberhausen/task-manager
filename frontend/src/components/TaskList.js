import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import TaskRow from './TaskRow';
import TaskForm from './TaskForm';
import { useTasks } from '../hooks/useTasks';
import { priorityColors, isOverdue } from '../utils/taskHelpers';
import '../styles/TaskList.css';

const TaskList = ({ token }) => {
  const {
    tasks,
    editingTaskId,
    setEditingTaskId,
    editingName,
    setEditingName,
    handleDelete,
    moveTask,
    toggleCompletion,
    updateTask,
    createTask,
    setTasks,
    handleNameUpdate
  } = useTasks(token);

  const [editingTask, setEditingTask] = useState(null);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);

  const toggleTaskPanel = () => {
    setTaskPanelOpen(!taskPanelOpen);
  };

  const handleSave = async (task) => {
    try {
      if (task._id) {
        await updateTask(task._id, task, token);
        setTasks(tasks.map(t => (t._id === task._id ? task : t)));
      } else {
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

  const startEditing = (task) => {
    setEditingTask(task);
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
                toggleCompletion={toggleCompletion}
                startEditing={startEditing}
                handleDelete={handleDelete}
                moveTask={moveTask}
                isOverdue={isOverdue}
                priorityColors={priorityColors}
                handleNameUpdate={handleNameUpdate}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskList;
