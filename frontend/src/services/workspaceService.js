import axios from './axiosConfig';

// Get all workspaces for the current user
export const getWorkspaces = async (token) => {
  try {
    const response = await axios.get('/api/workspaces', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

// Create a new workspace
export const createWorkspace = async (name, token) => {
  try {
    const response = await axios.post('/api/workspaces', { name }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }
};

// Update a workspace
export const updateWorkspace = async (workspaceId, updates, token) => {
  try {
    const response = await axios.patch(`/api/workspaces/${workspaceId}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }
};

// Delete a workspace
export const deleteWorkspace = async (workspaceId, token) => {
  try {
    const response = await axios.delete(`/api/workspaces/${workspaceId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
};
