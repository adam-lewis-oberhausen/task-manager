import axios from './axiosConfig';
import { createLogger } from '../utils/logger';
const logger = createLogger('WORKSPACE_SERVICE');

// Get all workspaces for the current user
export const getWorkspaces = async (token) => {
  try {
    logger.debug('Fetching workspaces');
    const response = await axios.get('/api/workspaces', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Workspaces fetched successfully', {
      count: response.data.length
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching workspaces:', {
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};

// Create a new workspace
export const createWorkspace = async (name, token) => {
  try {
    logger.debug('Creating new workspace', { name });
    const response = await axios.post('/api/workspaces', { name }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Workspace created successfully', {
      id: response.data._id,
      name: response.data.name
    });
    return response.data;
  } catch (error) {
    logger.error('Error creating workspace:', {
      error: error.message,
      status: error.response?.status,
      name
    });
    throw error;
  }
};

// Update a workspace
export const updateWorkspace = async (workspaceId, updates, token) => {
  try {
    logger.debug('Updating workspace', {
      id: workspaceId,
      updates
    });
    const response = await axios.patch(`/api/workspaces/${workspaceId}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Workspace updated successfully', {
      id: response.data._id,
      name: response.data.name
    });
    return response.data;
  } catch (error) {
    logger.error('Error updating workspace:', {
      id: workspaceId,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};

// Delete a workspace
export const deleteWorkspace = async (workspaceId, token) => {
  try {
    logger.debug('Deleting workspace', { id: workspaceId });
    const response = await axios.delete(`/api/workspaces/${workspaceId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Workspace deleted successfully', { id: workspaceId });
    return response.data;
  } catch (error) {
    logger.error('Error deleting workspace:', {
      id: workspaceId,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};
