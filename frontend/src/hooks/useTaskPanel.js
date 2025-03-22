import { useState, useCallback } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('USE_TASK_PANEL');

/**
 * Custom hook for managing task panel state
 * @param {boolean} initialState - Initial open/closed state of the panel
 * @returns {object} - Task panel state and handlers
 */
const useTaskPanel = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [editingTask, setEditingTask] = useState(null);

  const openPanel = useCallback((task = null) => {
    logger.info('Opening task panel', { taskId: task?._id });
    setIsOpen(true);
    setEditingTask(task);
  }, []);

  const closePanel = useCallback(() => {
    logger.info('Closing task panel');
    setIsOpen(false);
    setEditingTask(null);
  }, []);

  const togglePanel = useCallback(() => {
    logger.info('Toggling task panel', { newState: !isOpen });
    setIsOpen(prev => !prev);
  }, [isOpen]);

  return {
    isOpen,
    editingTask,
    openPanel,
    closePanel,
    togglePanel
  };
};

export default useTaskPanel;
