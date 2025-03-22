import React, { useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { Table, TableBody } from '../ui/Table';
import TaskTableHeader from './TaskTableHeader';
import TaskPanel from './TaskPanel';
import TaskRow from './TaskRow';
import Button from '../ui/Button';
import stylesButton from '../ui/Button.module.css';
import useTasks from '../../hooks/tasks/useTasks';
import useTaskPanel from '../../hooks/useTaskPanel';
import useWorkspaceData from '../../hooks/useWorkspaceData';
import useTaskCallbacks from '../../hooks/useTaskCallbacks';
import { priorityColors, isOverdue } from '../../utils/taskHelpers';
import { createLogger } from '../../utils/logger';

const logger = createLogger('TASK_LIST');

const DEFAULT_TASK = {
  name: '',
  description: '',
  priority: 'Medium',
  dueDate: ''
};

const TaskList = ({ token }) => {
  const { currentProject, fetchWorkspaces, fetchProjects } = useContext(WorkspaceContext);
  const taskPanel = useTaskPanel();
  const { initializeData } = useWorkspaceData(token, useContext(WorkspaceContext)); 

  // Initialize tasks hook
  const {
    tasks,
    handleDelete,
    toggleCompletion,
    handleTaskUpdate,
    fetchTasks
  } = useTasks(token, currentProject?._id);

  // Initialize task callbacks
  const {
    handleSave,
    handleCancel,
    getTaskCallbacks
  } = useTaskCallbacks(taskPanel, handleTaskUpdate, toggleCompletion, handleDelete);

  // Refresh tasks when project changes
  const prevProjectId = useRef(currentProject?._id);

  useEffect(() => {
    if (currentProject?._id && currentProject._id !== prevProjectId.current) {
      logger.debug('Project changed, refreshing tasks');
      prevProjectId.current = currentProject._id;
      fetchTasks(true); // Force refresh when project changes
    }
  }, [currentProject?._id, fetchTasks]);

  return (
    <div className="task-list-wrapper">
      <div className="task-list-controls">
        <Button
          onClick={taskPanel.togglePanel}
          className={stylesButton.button}
          aria-label={taskPanel.isOpen ? 'Close task panel' : 'Open task panel'}
        >
          {taskPanel.isOpen ? 'Close Panel' : 'Add Task'}
        </Button>
      </div>

      <div className="task-list-container">
        <TaskPanel
          isOpen={taskPanel.isOpen}
          editingTask={taskPanel.editingTask || DEFAULT_TASK}
          onSave={handleSave}
          onCancel={handleCancel}
          currentProject={currentProject}
        />

        <Table aria-label="Task list">
          <TaskTableHeader />
          <TableBody>
            {tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                callbacks={getTaskCallbacks(task)}
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
