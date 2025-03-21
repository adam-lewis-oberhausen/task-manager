import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      const { status, data } = error.response;
      if (status === 401) {
        // Handle unauthorized errors
        localStorage.removeItem('token');
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(data || error.message);
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject('Network error - please check your connection');
    } else {
      // Something happened in setting up the request
      return Promise.reject(error.message);
    }
  }
);

export default instance;
