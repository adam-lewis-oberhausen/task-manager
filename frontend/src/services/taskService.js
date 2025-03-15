import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/tasks';

export const getTasks = async (token) => {
  const response = await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createTask = async (task, token) => {
  try {
    const response = await axios.post(BASE_URL, task, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, updatedTask, token) => {
  try {
    const response = await axios.patch(`${BASE_URL}/${id}`, updatedTask, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export const updateTaskOrder = async (orderUpdates) => {
  const response = await axios.patch(`${BASE_URL}/order`, { orderUpdates });
  return response.data;
};
