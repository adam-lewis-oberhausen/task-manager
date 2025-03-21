import axios from './axiosConfig';
import { createLogger } from '../utils/logger';
const logger = createLogger('PROJECT_SERVICE');

// Get all projects for a workspace
export const getProjects = async (workspaceId, token) => {
  try {
    logger.debug('Fetching projects for workspace:', { workspaceId });
    const response = await axios.get(`/api/projects?workspace=${workspaceId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Projects fetched successfully', {
      count: response.data.length,
      workspaceId
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching projects:', {
      error: error.message,
      status: error.response?.status,
      workspaceId
    });
    throw error;
  }
};

// Create a new project
export const createProject = async (workspaceId, name, token) => {
  try {
    logger.debug('Creating new project:', { workspaceId, name });
    const response = await axios.post('/api/projects', {
      name,
      workspace: workspaceId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Project created successfully', {
      id: response.data._id,
      name: response.data.name,
      workspaceId
    });
    return response.data;
  } catch (error) {
    logger.error('Error creating project:', {
      error: error.message,
      status: error.response?.status,
      workspaceId,
      name
    });
    throw error;
  }
};

// Update a project
export const updateProject = async (projectId, updates, token) => {
  try {
    logger.debug('Updating project:', { projectId, updates });
    const response = await axios.patch(`/api/projects/${projectId}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Project updated successfully', {
      id: response.data._id,
      name: response.data.name
    });
    return response.data;
  } catch (error) {
    logger.error('Error updating project:', {
      error: error.message,
      status: error.response?.status,
      projectId
    });
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId, token) => {
  try {
    logger.debug('Deleting project:', { projectId });
    const response = await axios.delete(`/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Project deleted successfully', { projectId });
    return response.data;
  } catch (error) {
    logger.error('Error deleting project:', {
      error: error.message,
      status: error.response?.status,
      projectId
    });
    throw error;
  }
};
