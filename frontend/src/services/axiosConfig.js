import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
});

console.log('Axios base URL:', instance.defaults.baseURL);

export default instance;
