import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('USE_TASK_FORM');

const useTaskForm = (initialTask, onSubmit) => {
  const [formState, setFormState] = useState({
    name: initialTask?.name || '',
    description: initialTask?.description || '',
    priority: initialTask?.priority || 'Medium',
    dueDate: initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().substr(0, 10) : '',
    error: ''
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    logger.debug('Form field changed', { field: name, value });
    setFormState(prev => ({
      ...prev,
      [name]: value,
      error: ''
    }));
  }, []);

  const handleDescriptionChange = useCallback((value) => {
    logger.debug('Description changed', { length: value.length });
    setFormState(prev => ({
      ...prev,
      description: value,
      error: ''
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    logger.info('Form submission initiated');

    // Validate required fields
    if (!formState.name.trim()) {
      const errorMsg = 'Task name is required';
      logger.warn('Validation failed', { error: errorMsg });
      setFormState(prev => ({ ...prev, error: errorMsg }));
      return;
    }

    const taskData = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      priority: formState.priority,
      dueDate: formState.dueDate ? new Date(formState.dueDate).toISOString() : null
    };

    try {
      await onSubmit(taskData);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Task submission failed';
      logger.error('Submission failed', { error: errorMsg });
      setFormState(prev => ({ ...prev, error: errorMsg }));
    }
  }, [formState, onSubmit]);

  return {
    formState,
    handleChange,
    handleDescriptionChange,
    handleSubmit
  };
};

export default useTaskForm;
