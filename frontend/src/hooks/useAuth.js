import { useCallback } from 'react';
import axios from '../services/axiosConfig';
import { createLogger } from '../utils/logger';

const logger = createLogger('USE_AUTH');

const useAuth = (onLogin) => {
  const handleLogin = useCallback(async (credentials) => {
    logger.info('Login attempt initiated');
    
    try {
      const response = await axios.post('/api/auth/login', credentials);
      logger.info('Login successful');
      onLogin(response.data.token);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      logger.error('Login failed', {
        error: errorMessage,
        status: error.response?.status
      });
      return { success: false, error: errorMessage };
    }
  }, [onLogin]);

  const handleRegister = useCallback(async (credentials) => {
    logger.info('Registration attempt initiated');
    
    try {
      const response = await axios.post('/api/auth/register', credentials);
      logger.info('Registration successful');
      onLogin(response.data.token);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      logger.error('Registration failed', {
        error: errorMessage,
        status: error.response?.status
      });
      return { success: false, error: errorMessage };
    }
  }, [onLogin]);

  return {
    handleLogin,
    handleRegister
  };
};

export default useAuth;
