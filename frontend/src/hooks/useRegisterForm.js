import { useState, useCallback } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('REGISTER_FORM');

const useRegisterForm = (onSubmit) => {
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
      error: '' // Clear error when user types
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    logger.info('Form submission initiated');
    
    // Normalize inputs
    const normalizedEmail = formState.email.trim().toLowerCase();
    const normalizedPassword = formState.password.trim();

    // Validate email
    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      const errorMsg = 'Please enter a valid email address.';
      logger.warn('Email validation failed', { error: errorMsg });
      setFormState(prev => ({ ...prev, error: errorMsg }));
      return;
    }

    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(normalizedPassword)) {
      const errorMsg = 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.';
      logger.warn('Password validation failed', { error: errorMsg });
      setFormState(prev => ({ ...prev, error: errorMsg }));
      return;
    }

    try {
      await onSubmit({
        email: normalizedEmail,
        password: normalizedPassword
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      logger.error('Registration failed', { error: errorMsg });
      setFormState(prev => ({ ...prev, error: errorMsg }));
    }
  }, [formState, onSubmit]);

  return {
    formState,
    handleChange,
    handleSubmit
  };
};

export default useRegisterForm;
