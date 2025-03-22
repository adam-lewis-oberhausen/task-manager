import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { Table, TableBody } from './ui/Table';
import TaskTableHeader from './TaskTableHeader';
import TaskPanel from './TaskPanel';
import TaskRow from './TaskRow';
import Button from './ui/Button';
import stylesButton from './ui/Button.module.css';
import { useTasks } from '../hooks/useTasks';
import useTaskPanel from '../hooks/useTaskPanel';
import useWorkspaceData from '../hooks/useWorkspaceData';
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

/**
 * Main task list component
 * @param {Object} props - Component props
 * @param {string} props.token - Authentication token
 * @returns {JSX.Element} Task list component
 */
const TaskList = ({ token }) => {
  // Context and State Management
  const { currentProject, fetchWorkspaces, fetchProjects } = useContext(WorkspaceContext);
  const taskPanel = useTaskPanel();
  
  // Custom hooks
  const { initializeData } = useWorkspaceData(token, fetchWorkspaces, fetchProjects);
  const {
    tasks,
    handleDelete,
    toggleCompletion,
    handleTaskUpdate
  } = useTasks(token, currentProject?._id);

  const startEditing = useCallback((task) => {
    logger.info('Starting task edit', { taskId: task._id });
    taskPanel.openPanel(task);
  }, [taskPanel]);

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

  return (
    <div>
      <Button
        onClick={taskPanel.togglePanel}
        className={stylesButton.button}
      >
        {taskPanel.isOpen ? 'Close Panel' : 'Add Task'}
      </Button>

      <div className="task-list-container">
        <TaskPanel
          isOpen={taskPanel.isOpen}
          editingTask={taskPanel.editingTask || DEFAULT_TASK}
          onSave={handleSave}
          onCancel={handleCancel}
          currentProject={currentProject}
        />

        <Table>
          <TaskTableHeader />
          <TableBody>
            {tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                callbacks={{
                  toggleCompletion: () => toggleCompletion(task),
                  handleDelete: () => handleDelete(task._id),
                  startEditing: () => startEditing(task)
                }}
                isOverdue={isOverdue}
                priorityColors={priorityColors}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

TaskList.propTypes = {
  token: PropTypes.string.isRequired
};

export default React.memo(TaskList);
