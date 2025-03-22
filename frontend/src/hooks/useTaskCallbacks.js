import { useCallback } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('USE_TASK_CALLBACKS');

const useTaskCallbacks = (taskPanel, handleTaskUpdate, toggleCompletion, handleDelete) => {
  const startEditing = useCallback((task) => {
    logger.info('Starting task edit', { taskId: task._id });
    taskPanel.openPanel(task);
  }, [taskPanel]);

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

  const getTaskCallbacks = useCallback((task) => ({
    toggleCompletion: () => toggleCompletion(task),
    handleDelete: () => handleDelete(task._id),
    startEditing: () => startEditing(task)
  }), [toggleCompletion, handleDelete, startEditing]);

  return {
    handleSave,
    handleCancel,
    getTaskCallbacks
  };
};

export default useTaskCallbacks;
