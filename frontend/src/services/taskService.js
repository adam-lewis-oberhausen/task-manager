import axios from './axiosConfig';
import { createLogger } from '../utils/logger';
const logger = createLogger('TASK_SERVICE');

const BASE_URL = '/api/tasks';

export const getTasks = async (token, projectId) => {
  try {
    if (!projectId) {
      logger.debug('No project ID provided, returning empty task list');
      return [];
    }

    logger.debug('Fetching tasks for project:', projectId);
    const response = await axios.get(`${BASE_URL}?project=${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Tasks fetched successfully', {
      count: response.data.length
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching tasks:', {
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};

export const createTask = async (task) => {
  try {
    // Validate task data
    if (!task.name || typeof task.name !== 'string') {
      const errorMsg = 'Task name is required and must be a string';
      logger.warn('Task validation failed', {
        error: errorMsg,
        taskData: task
      });
      throw new Error(errorMsg);
    }

    // Prepare payload
    const payload = {
      name: task.name.trim(),
      description: task.description?.trim() || '',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate || null,
      project: task.project || null
    };

    logger.debug('Creating new task with payload:', payload);
    const response = await axios.post(BASE_URL, payload);
    logger.debug('Task created successfully', {
      id: response.data._id,
      name: response.data.name
    });
    return response.data;
  } catch (error) {
    logger.error('Error creating task:', {
      error: error.message,
      status: error.response?.status,
      taskData: task
    });
    throw error;
  }
};

export const updateTask = async (id, updatedTask) => {
  try {
    logger.debug('Updating task', {
      id,
      updates: updatedTask
    });
    const response = await axios.patch(`${BASE_URL}/${id}`, updatedTask);
    logger.debug('Task updated successfully', {
      id: response.data._id,
      name: response.data.name
    });
    return response.data;
  } catch (error) {
    logger.error('Error updating task:', {
      id,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    logger.debug('Deleting task', { id });
    const response = await axios.delete(`${BASE_URL}/${id}`);
    logger.debug('Task deleted successfully', { id });
    return response.data;
  } catch (error) {
    logger.error('Error deleting task:', {
      id,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};

export const updateTaskOrder = async (orderUpdates) => {
  try {
    logger.debug('Updating task order', {
      count: orderUpdates.length
    });
    const response = await axios.patch(`${BASE_URL}/order`, { orderUpdates });
    logger.debug('Task order updated successfully', {
      count: orderUpdates.length
    });
    return response.data;
  } catch (error) {
    logger.error('Error updating task order:', {
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};
