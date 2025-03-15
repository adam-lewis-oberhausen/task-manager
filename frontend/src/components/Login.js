import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import axios from '../services/axiosConfig';
import '../styles/Login.css';

const Login = ({ onLogin, setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      console.log('Attempting to login with:', { username, password });
      const response = await axios.post('/api/auth/login', { email: username.trim(), password });
      console.log('Login response:', response);
      setError('Login successful!');
      onLogin(response.data.token);
    } catch (error) {
      console.error('Error logging in:', error.response || error.message);
      if (error.response && error.response.data) {
        console.error('Login error details:', error.response.data);
        setError(error.response.data);
      } else {
        setError('Login failed');
      }
    }
  };

  return (
    <div className="login-container">                                                                                                 
      <div className="login-box">                                                                                                     
        <h2 className="login-title">Login</h2>
        <TextField fullWidth margin="normal" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>{error}</div>}
        <Button fullWidth variant="contained" color="primary" onClick={handleLogin}>Login</Button>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span>No account yet? </span>
          <button className="link-button" onClick={() => setView('register')}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
