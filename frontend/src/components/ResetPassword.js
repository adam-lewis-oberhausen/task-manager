import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../services/axiosConfig';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    try {
      await axios.post('/api/auth/reset-password/confirm', { token, password });
      setMessage('Password reset successful');
    } catch (error) {
      setMessage('Error resetting password');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password"
      />
      <button onClick={handleReset}>Reset Password</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
