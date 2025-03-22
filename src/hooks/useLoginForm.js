import { useState, useCallback } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('USE_LOGIN_FORM');

const useLoginForm = (onSubmit) => {
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    error: ''
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    logger.debug('Form field changed', { field: name, value });
    setFormState(prev => ({
      ...prev,
      [name]: value,
      error: '' // Clear error on change
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    logger.info('Form submission initiated');
    
    // Normalize inputs
    const credentials = {
      email: formState.email.trim().toLowerCase(),
      password: formState.password.trim()
    };

    const result = await onSubmit(credentials);
    if (!result.success) {
      logger.debug('Updating form with error', { error: result.error });
      setFormState(prev => ({
        ...prev,
        error: result.error
      }));
    }
  }, [formState, onSubmit]);

  return {
    formState,
    handleChange,
    handleSubmit
  };
};

export default useLoginForm;
