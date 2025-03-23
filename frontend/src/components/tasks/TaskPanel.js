import React from 'react';
import PropTypes from 'prop-types';
import TaskForm from './TaskForm';
import styles from './TaskPanel.module.css';
import { createLogger } from '../../utils/logger';

const logger = createLogger('TASK_PANEL');

/**
 * Renders the task panel with form
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether panel is open
 * @param {Object} props.editingTask - Task being edited
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {Object} props.currentProject - Current project context
 * @returns {JSX.Element} Task panel component
 */
const TaskPanel = ({ isOpen, editingTask, onSave, onCancel, currentProject }) => {
  logger.debug('Rendering task panel', {
    isOpen,
    editingTaskId: editingTask?._id,
    currentProjectId: currentProject?._id
  });

  if (!isOpen) return null;

  return (
    <div
      className="task-panel open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-panel-title"
    >
      <h2 id="task-panel-title" className={styles.visuallyHidden}>
        {editingTask._id ? 'Edit Task' : 'Create New Task'}
      </h2>
      <TaskForm
        key={editingTask?._id || 'new-task'}
        task={editingTask}
        onSave={onSave}
        onCancel={onCancel}
        currentProject={currentProject}
      />
    </div>
  );
};

TaskPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  editingTask: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    dueDate: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  currentProject: PropTypes.shape({
    _id: PropTypes.string
  })
};

export default React.memo(TaskPanel);
