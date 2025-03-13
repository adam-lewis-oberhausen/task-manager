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

export const createTask = async (task) => {
  const response = await axios.post(BASE_URL, task);
  return response.data;
};

export const updateTask = async (id, updatedTask) => {
  const response = await axios.patch(`${BASE_URL}/${id}`, updatedTask);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export const updateTaskOrder = async (orderUpdates) => {
  const response = await axios.patch(`${BASE_URL}/order`, { orderUpdates });
  return response.data;
};
