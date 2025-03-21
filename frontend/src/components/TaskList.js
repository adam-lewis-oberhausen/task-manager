import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { Table, TableHead, TableBody, TableRow, TableCell } from './ui/Table';
import styles from './ui/Table.module.css';
import Button from './ui/Button';
import stylesButton from './ui/Button.module.css';
import TaskRow from './TaskRow';
import TaskForm from './TaskForm';
import { useTasks } from '../hooks/useTasks';
import { priorityColors, isOverdue } from '../utils/taskHelpers';
import { taskListLogger } from '../utils/logger';

const TaskList = ({ token }) => {
  const { currentProject } = useContext(WorkspaceContext);
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
    updateTasksOrder,
    setName,
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
    setEditingTask(null);
    setEditingTaskId(null);
    setEditingName(null);
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
    setEditingTaskId(task._id);
    setEditingName(task.name);
    if (!taskPanelOpen) {
      taskListLogger.debug('Opening task panel for editing');
      setTaskPanelOpen(true);
    }
  };

  return (
    <div>
      <Button onClick={toggleTaskPanel} className={stylesButton.button}>
        {taskPanelOpen ? 'Close Panel' : 'Add Task'}
      </Button>
        <div className={styles.customTable}>
        <div className={`task-panel ${taskPanelOpen ? 'open' : ''}`}>
          <TaskForm
            key={editingTask?._id || 'new-task'} // Force remount when switching between new/edit
            task={{
              ...editingTask,
              name: editingTaskId === editingTask?._id ? editingName : editingTask?.name
            }}
            editingTaskId={editingTaskId}
            setEditingName={setEditingName}
            editingName={editingName}
            setEditingTaskId={setEditingTaskId}
            onSave={handleSave}
            onCancel={() => {
              setEditingTask(null);
              handleCancel();
            }}
            token={token}
            currentProject={currentProject}
          />
        </div>
        <Table>
            <TableHead>
              <TableRow>
                <TableCell className={styles.tableCellHeader}></TableCell>
                <TableCell className={styles.tableCellHeader}>Complete</TableCell>
                <TableCell className={styles.tableCellHeader}>Assignee</TableCell>
                <TableCell className={styles.tableCellHeader}>Name</TableCell>
                <TableCell className={styles.tableCellHeader}>Due Date</TableCell>
                <TableCell className={styles.tableCellHeader}>Priority</TableCell>
                <TableCell className={styles.tableCellHeader}>Edit</TableCell>
                <TableCell className={styles.tableCellHeader}>Delete</TableCell>
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
                  setName={setName}
                />
              ))}
            </TableBody>
          </Table>
      </div>
    </div>
  );
};

export default TaskList;
