import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { Table, TableHead, TableBody, TableRow, TableCell } from './ui/Table';
import styles from './ui/Table.module.css';
import Button from './ui/Button';
import stylesButton from './ui/Button.module.css';
import TaskRow from './TaskRow';
import TaskForm from './TaskForm';
import { useTasks } from '../hooks/useTasks';
import { priorityColors, isOverdue } from '../utils/taskHelpers';
import { createLogger } from '../utils/logger';

const logger = createLogger('TASK_LIST');

// Constants
const DEFAULT_TASK = {
  name: '',
  description: '',
  priority: 'Medium',
  dueDate: ''
};

import useTaskPanel from '../hooks/useTaskPanel';

const TaskList = ({ token }) => {
  // Context and State Management
  const { currentProject, fetchWorkspaces, fetchProjects } = useContext(WorkspaceContext);
  const taskPanel = useTaskPanel();
  const isMounted = useRef(false);

  // Task Operations
  const {
    tasks,
    editingTaskId,
    setEditingTaskId,
    editingName,
    setEditingName,
    handleDelete,
    toggleCompletion,
    handleTaskUpdate,
    setName
  } = useTasks(token, currentProject?._id);

  // Lifecycle and Initialization
  const initializeData = useCallback(async () => {
    if (token) {
      try {
        logger.debug('Initializing workspace and project data');
        await Promise.all([fetchWorkspaces(), fetchProjects()]);
      } catch (error) {
        logger.error('Error initializing data:', error);
      }
    }
  }, [token, fetchWorkspaces, fetchProjects]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      logger.info('TaskList component mounted');
      initializeData();
    }

    return () => {
      if (isMounted.current) {
        logger.info('TaskList component unmounted');
        isMounted.current = false;
      }
    };
  }, [initializeData]);

  // Task Operations Handlers
  const handleSave = useCallback(async (task) => {
    logger.info('Saving task', { taskId: task._id });
    const success = await handleTaskUpdate(task);

    if (success) {
      logger.info('Task saved successfully');
      taskPanel.closePanel();
    } else {
      logger.error('Failed to save task');
    }
  }, [handleTaskUpdate, taskPanel]);

  const handleCancel = useCallback(() => {
    logger.info('Task edit canceled');
    taskPanel.closePanel();
  }, [taskPanel]);

  const startEditing = useCallback((task) => {
    logger.info('Starting task edit', { taskId: task._id });
    setEditingTaskId(task._id);
    setEditingName(task.name);
    taskPanel.openPanel(task);
  }, [setEditingTaskId, setEditingName, taskPanel]);

  // Render Methods
  const renderTaskPanel = () => (
    taskPanel.isOpen && (
      <TaskForm
        key={taskPanel.editingTask?._id || 'new-task'}
        task={taskPanel.editingTask || DEFAULT_TASK}
        onSave={handleSave}
        onCancel={handleCancel}
        token={token}
        currentProject={currentProject}
        isMounted={isMounted}
        editingTaskId={editingTaskId}
        setEditingName={setEditingName}
      />
    )
  );

  const renderTableHeader = () => (
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
  );

  const renderTaskRows = () => tasks.map((task, index) => (
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
      isOverdue={isOverdue}
      priorityColors={priorityColors}
      handleTaskUpdate={handleTaskUpdate}
      startEditing={startEditing}
      setName={setName}
    />
  ));

  return (
    <div>
      <Button
        onClick={taskPanel.togglePanel}
        className={stylesButton.button}
      >
        {taskPanel.isOpen ? 'Close Panel' : 'Add Task'}
      </Button>

      <div className={styles.customTable}>
        <div className={`task-panel ${taskPanel.isOpen ? 'open' : ''}`}>
          {renderTaskPanel()}
        </div>

        <Table>
          {renderTableHeader()}
          <TableBody>
            {renderTaskRows()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default React.memo(TaskList);
