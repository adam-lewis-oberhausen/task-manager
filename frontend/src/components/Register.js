import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import axios from '../services/axiosConfig';

const Register = ({ setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      console.log('Attempting to register with:', { username, password });
      const response = await axios.post('/api/auth/register', { username, password });
      console.log('Registration response:', response);
      alert('Registration successful!');
    } catch (error) {
      console.error('Error registering:', error.response || error.message);
      alert('Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '300px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center' }}>Register</h2>
        <TextField fullWidth margin="normal" label="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button fullWidth variant="contained" color="primary" onClick={handleRegister}>Register</Button>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span>Already have an account? </span>
          <a href="#" onClick={() => setView('login')}>Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
