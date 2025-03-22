import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { Table, TableBody } from './ui/Table';
import TaskTableHeader from './TaskTableHeader';
import TaskPanel from './TaskPanel';
import styles from './ui/Table.module.css';
import Button from './ui/Button';
import stylesButton from './ui/Button.module.css';
import TaskRow from './TaskRow';
import { useTasks } from '../hooks/useTasks';
import useTaskPanel from '../hooks/useTaskPanel';
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
    <TaskPanel
      isOpen={taskPanel.isOpen}
      editingTask={taskPanel.editingTask || DEFAULT_TASK}
      onSave={handleSave}
      onCancel={handleCancel}
      currentProject={currentProject}
    />
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
          <TaskTableHeader />
          <TableBody>
            {renderTaskRows()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default React.memo(TaskList);
