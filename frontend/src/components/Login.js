import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import axios from '../services/axiosConfig';

const Login = ({ onLogin, setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      console.log('Attempting to login with:', { username, password });
      const response = await axios.post('/api/auth/login', { email: username, password });
      console.log('Login response:', response);
      onLogin(response.data.token);
    } catch (error) {
      console.error('Error logging in:', error.response || error.message);
      if (error.response && error.response.data) {
        console.error('Login error details:', error.response.data);
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '300px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        <TextField fullWidth margin="normal" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button fullWidth variant="contained" color="primary" onClick={handleLogin}>Login</Button>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span>No account yet? </span>
          <a href="#" onClick={() => setView('register')}>Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
