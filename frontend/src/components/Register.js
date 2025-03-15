import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import axios from '../services/axiosConfig';
import '../styles/Register.css';

const Register = ({ setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    // Validate email and password
    if (!username || !/\S+@\S+\.\S+/.test(username)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    try {
      console.log('Attempting to register with:', { username, password });
      const response = await axios.post('/api/auth/register', { email: username, password });
      console.log('Registration response:', response);
      setView('login');
    } catch (error) {
      console.error('Error registering:', error.response || error.message);
      if (error.response && error.response.data) {
        setError(error.response.data);
      } else {
        setError('Registration failed');
      }
    }
  };

  return (
    <div className="register-container">                                                                                              
      <div className="register-box">                                                                                                  
        <h2 className="register-title">Register</h2> 
        <TextField fullWidth margin="normal" label="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField fullWidth margin="normal" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>{error}</div>}
        <Button fullWidth variant="contained" color="primary" onClick={handleRegister}>Register</Button>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span>Already have an account? </span>
          <button className="link-button" onClick={() => setView('login')}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
