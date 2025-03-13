import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      onLogin(response.data.token);
      alert('Login successful!');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '300px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
      <h2>Login</h2>
      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleLogin}>Login</Button>
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        <TextField fullWidth margin="normal" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button fullWidth variant="contained" color="primary" onClick={handleLogin}>Login</Button>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span>No account yet? </span>
          <a href="#" onClick={() => alert('Redirect to register')}>Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
