import axios from './axiosConfig';

// Get all projects for a workspace
export const getProjects = async (workspaceId, token) => {
  try {
    const response = await axios.get(`/api/projects?workspace=${workspaceId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Create a new project
export const createProject = async (workspaceId, name, token) => {
  try {
    const response = await axios.post('/api/projects', {
      name,
      workspace: workspaceId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Update a project
export const updateProject = async (projectId, updates, token) => {
  try {
    const response = await axios.patch(`/api/projects/${projectId}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId, token) => {
  try {
    const response = await axios.delete(`/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};
