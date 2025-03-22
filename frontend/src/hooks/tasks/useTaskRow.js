import { useCallback } from 'react';
import { createLogger } from '../../utils/logger';

const logger = createLogger('USE_TASK_ROW');

const useTaskRow = (task, { toggleCompletion, handleDelete, startEditing }) => {
  const handleToggleCompletion = useCallback(() => {
    logger.info('Toggling task completion:', {
      id: task._id,
      name: task.name,
      currentState: task.completed,
      newState: !task.completed
    });
    toggleCompletion(task);
  }, [task, toggleCompletion]);

  const handleEdit = useCallback(() => {
    logger.info('Starting task edit:', {
      id: task._id,
      name: task.name
    });
    startEditing(task);
  }, [task, startEditing]);

  const handleDeleteTask = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
      logger.info('Deleting task:', {
        id: task._id,
        name: task.name
      });
      handleDelete(task._id);
    } else {
      logger.debug('Task deletion canceled by user:', {
        id: task._id,
        name: task.name
      });
    }
  }, [task, handleDelete]);

  return {
    handleToggleCompletion,
    handleEdit,
    handleDeleteTask
  };
};

export default useTaskRow;
