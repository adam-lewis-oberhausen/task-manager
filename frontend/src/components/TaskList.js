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
    handleTaskUpdate
  } = useTasks(token);

  const [editingTask, setEditingTask] = useState(null);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);

  const toggleTaskPanel = () => {
    setTaskPanelOpen(!taskPanelOpen);
  };

  const handleSave = async (task) => {
    const success = await handleTaskUpdate(task);
    if (success) {
      setTaskPanelOpen(false);
      setEditingTask(null);
    }
  };

  const handleCancel = () => {
    setTaskPanelOpen(false);
    setEditingTask(null);
  };

  const startEditing = (task) => {
    setEditingTask(task);
    if (!taskPanelOpen) {
      setTaskPanelOpen(true);
    }
  };

  return (
    <div className="task-list-container">
      <Button variant="contained" color="primary" onClick={toggleTaskPanel} className="add-task-button">
        {taskPanelOpen ? 'Close Panel' : 'Add Task'}
      </Button>

      <div className={`task-panel ${taskPanelOpen ? 'open' : ''}`}>
        <TaskForm 
          task={editingTask}
          onSave={handleSave} 
          onCancel={() => {
            setEditingTask(null);
            handleCancel();
          }} 
          token={token}
        />
      </div>

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
                handleDelete={handleDelete}
                moveTask={moveTask}
                isOverdue={isOverdue}
                priorityColors={priorityColors}
                handleTaskUpdate={handleTaskUpdate}
                startEditing={startEditing}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskList;
