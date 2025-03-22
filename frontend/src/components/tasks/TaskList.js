import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { Table, TableBody } from '../ui/Table';
import TaskTableHeader from './TaskTableHeader';
import TaskPanel from './TaskPanel';
import TaskRow from './TaskRow';
import Button from '../ui/Button';
import stylesButton from '../ui/Button.module.css';
import { useTasks } from '../../hooks/useTasks';
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
  const { initializeData } = useWorkspaceData(token, fetchWorkspaces, fetchProjects);
  const {
    tasks,
    handleDelete,
    toggleCompletion,
    handleTaskUpdate
  } = useTasks(token, currentProject?._id);

  const {
    handleSave,
    handleCancel,
    getTaskCallbacks
  } = useTaskCallbacks(taskPanel, handleTaskUpdate, toggleCompletion, handleDelete);

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
