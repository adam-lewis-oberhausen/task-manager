import React, { useState, useEffect, useContext, useRef } from 'react';
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

const defaultTask = {
  name: '',
  description: '',
  priority: 'Medium',
  dueDate: ''
};

const TaskList = ({ token }) => {
  const prevToken = useRef(token);

  // Component lifecycle logging
  useEffect(() => {
    if (!isMounted.current) {
      logger.info('TaskList component mounted');
      isMounted.current = true;
    }

    return () => {
      if (isMounted.current) {
        logger.info('TaskList component unmounted');
        isMounted.current = false;
      }
    };
  }, []);

  // Log token changes
  useEffect(() => {
    if (isMounted.current && token !== prevToken.current) {
      logger.info('Token changed, re-rendering TaskList');
      prevToken.current = token;
    }
  }, [token]);

  const {
    currentProject,
    fetchWorkspaces,
    fetchProjects
  } = useContext(WorkspaceContext);

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
  } = useTasks(token, currentProject?._id);

  const [editingTask, setEditingTask] = useState(null);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      logger.debug('TaskList component mounted');

      // Initialize all required data
      if (token) {
        Promise.all([
          fetchWorkspaces(),
          fetchProjects()
        ]).catch(error => {
          logger.error('Error initializing data:', error);
        });
      }
    }
    return () => {
      isMounted.current = false;
    };
  }, [fetchWorkspaces, fetchProjects, token]);

  useEffect(() => {
    if (isMounted.current) {
      logger.debug('Task panel state changed:', taskPanelOpen);
    }
  }, [taskPanelOpen]);

  useEffect(() => {
    if (isMounted.current) {
      logger.debug('Editing task changed:', editingTask);
    }
  }, [editingTask]);

  const toggleTaskPanel = () => {
    const newState = !taskPanelOpen;
    logger.info(`Task panel ${newState ? 'opened' : 'closed'}`);
    setTaskPanelOpen(newState);
    setEditingTask(null);
    setEditingTaskId(null);
    setEditingName(null);
  };

  const handleSave = async (task) => {
    logger.info(`Attempting to save task: ${task._id || 'new task'}`, {
      name: task.name,
      project: task.project,
      priority: task.priority
    });

    const success = await handleTaskUpdate(task);
    if (success) {
      logger.info(`Task ${task._id || 'new task'} saved successfully`);
      setTaskPanelOpen(false);
      setEditingTask(null);
    } else {
      logger.error(`Failed to save task: ${task._id || 'new task'}`, {
        error: 'Save operation unsuccessful'
      });
    }
  };

  const handleCancel = () => {
    logger.info('Task edit canceled', {
      taskId: editingTask?._id || 'new task',
      panelWasOpen: taskPanelOpen
    });
    setTaskPanelOpen(false);
    setEditingTask(null);
  };

  const startEditing = (task) => {
    logger.info(`Starting to edit task: ${task._id} - "${task.name}"`);
    setEditingTask(task);
    setEditingTaskId(task._id);
    setEditingName(task.name);
    if (!taskPanelOpen) {
      logger.info('Opening task panel for editing');
      setTaskPanelOpen(true);
    }
  };

  return (
    <div>
      <Button onClick={toggleTaskPanel} className={stylesButton.button}>
        {taskPanelOpen ? 'Close Panel' : 'Add Task'}
      </Button>
        <div className={styles.customTable}>
        {taskPanelOpen && (
          <div className={`task-panel ${taskPanelOpen ? 'open' : ''}`}>
            <TaskForm
              key={editingTask?._id || 'new-task'}
              task={editingTask || defaultTask}
              onSave={handleSave}
              onCancel={() => {
                setEditingTask(null);
                handleCancel();
              }}
              token={token}
              currentProject={currentProject}
              isMounted={isMounted}
              editingTaskId={editingTaskId}
              setEditingName={setEditingName}
            />
          </div>
        )}
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

export default React.memo(TaskList);
