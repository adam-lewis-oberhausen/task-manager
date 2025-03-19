import React, { useState } from 'react';
import axios from '../services/axiosConfig';
import Form from './ui/Form';
import Input from './ui/Input';
import Button from './ui/Button';
import styles from './ui/Form.module.css';

const Login = ({ onLogin, setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const response = await axios.post('/api/auth/login', { 
        email: username.trim(), 
        password 
      });
      setError('Login successful!');
      onLogin(response.data.token);
    } catch (error) {
      setError(error.response?.data || 'Login failed');
    }
  };

  return (
    <Form>
      <h2 className={styles.title}>Login</h2>
      <div className={styles.formGroup}>
        <Input
          type="text"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className={styles.formGroup}>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.actions}>
        <Button onClick={handleLogin}>Login</Button>
      </div>
      <div className={styles.link}>
        No account yet?{' '}
        <button 
          className={styles.linkButton}
          onClick={() => setView('register')}
        >
          Register
        </button>
      </div>
    </Form>
  );
};

export default Login;
