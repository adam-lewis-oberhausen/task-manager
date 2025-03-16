import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import TaskRow from './TaskRow';
import TaskForm from './TaskForm';
import { useTasks } from '../hooks/useTasks';
import { priorityColors, isOverdue } from '../utils/taskHelpers';
import { taskListLogger } from '../utils/logger';
import '../styles/TaskList.css';

const TaskList = ({ token }) => {
  taskListLogger.info('TaskList component rendering with token.');
  const {
    tasks,
    editingTaskId,
    setEditingTaskId,
    editingName,
    setEditingName,
    handleDelete,
    moveTask,
    toggleCompletion,
    handleTaskUpdate,
    updateTasksOrder
  } = useTasks(token);

  const [editingTask, setEditingTask] = useState(null);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);

  useEffect(() => {
    taskListLogger.debug('Task panel state changed:', taskPanelOpen);
  }, [taskPanelOpen]);

  useEffect(() => {
    taskListLogger.debug('Editing task changed:', editingTask);
  }, [editingTask]);

  const toggleTaskPanel = () => {
    taskListLogger.debug('Toggling task panel');
    setTaskPanelOpen(!taskPanelOpen);
  };

  const handleSave = async (task) => {
    taskListLogger.info('Saving task:', task);
    const success = await handleTaskUpdate(task);
    if (success) {
      taskListLogger.info('Task saved successfully');
      setTaskPanelOpen(false);
      setEditingTask(null);
    } else {
      taskListLogger.warn('Task save failed');
    }
  };

  const handleCancel = () => {
    taskListLogger.debug('Canceling task edit');
    setTaskPanelOpen(false);
    setEditingTask(null);
  };

  const startEditing = (task) => {
    taskListLogger.debug('Starting to edit task:', task);
    setEditingTask(task);
    if (!taskPanelOpen) {
      taskListLogger.debug('Opening task panel for editing');
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
          key={editingTask?._id || 'new-task'} // Force remount when switching between new/edit
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
                updateTasksOrder={updateTasksOrder}
                updateTasksOrder={updateTasksOrder}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskList;
