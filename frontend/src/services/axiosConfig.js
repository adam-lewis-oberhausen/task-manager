import axios from 'axios';
import { createLogger } from '../utils/logger';
const logger = createLogger('AXIOS');

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
instance.interceptors.request.use(config => {
  logger.debug('Outgoing request:', {
    method: config.method.toUpperCase(),
    url: config.url,
    headers: Object.keys(config.headers)
  });
  
  const token = localStorage.getItem('token');
  if (token) {
    logger.info('Adding authorization token to request');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    logger.debug('No authorization token found');
  }
  return config;
}, error => {
  logger.error('Request interceptor error:', {
    message: error.message,
    config: {
      method: error.config?.method,
      url: error.config?.url
    }
  });
  return Promise.reject(error);
});

// Add response interceptor for error handling
instance.interceptors.response.use(
  response => {
    logger.debug('Received successful response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      const { status, data } = error.response;
      logger.error('API error response:', {
        status,
        url: error.config.url,
        error: data
      });
      
      if (status === 401) {
        logger.warn('Unauthorized access detected, removing token');
        localStorage.removeItem('token');
        if (!window.location.pathname.startsWith('/login')) {
          logger.info('Redirecting to login');
          window.location.href = '/login';
        }
      }
      return Promise.reject(data || error.message);
    } else if (error.request) {
      logger.error('Network error - no response received:', {
        message: error.message,
        config: {
          method: error.config?.method,
          url: error.config?.url
        }
      });
      return Promise.reject('Network error - please check your connection');
    } else {
      logger.error('Request setup error:', {
        message: error.message,
        stack: error.stack
      });
      return Promise.reject(error.message);
    }
  }
);

export default instance;
