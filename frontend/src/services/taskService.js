import axios from './axiosConfig';

const BASE_URL = '/api/tasks';

export const getTasks = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (task) => {
  try {
    // Validate task data
    if (!task.name || typeof task.name !== 'string') {
      throw new Error('Task name is required and must be a string');
    }

    // Prepare payload
    const payload = {
      name: task.name.trim(),
      description: task.description?.trim() || '',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate || null,
      project: task.project || null
    };

    const response = await axios.post(BASE_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, updatedTask) => {
  try {
    const response = await axios.patch(`${BASE_URL}/${id}`, updatedTask);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const updateTaskOrder = async (orderUpdates) => {
  try {
    const response = await axios.patch(`${BASE_URL}/order`, { orderUpdates });
    return response.data;
  } catch (error) {
    console.error('Error updating task order:', error);
    throw error;
  }
};
