import React, { useState, useEffect } from 'react';
import { createLogger } from '../utils/logger';
const logger = createLogger('LOGIN');
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
    logger.info('Login attempt initiated');
    setError('');
    
    try {
      const normalizedEmail = username.trim().toLowerCase();
      const normalizedPassword = password.trim();

      logger.debug('Login credentials normalized', {
        email: normalizedEmail,
        passwordLength: normalizedPassword.length
      });

      const response = await axios.post('/api/auth/login', {
        email: normalizedEmail,
        password: normalizedPassword
      });

      logger.info('Login successful');
      setError('Login successful!');
      onLogin(response.data.token);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      logger.error('Login failed', {
        error: errorMessage,
        status: error.response?.status
      });
      setError(errorMessage);
    }
  };

  return (
    <Form className={styles.form}>
      <h2 className={styles.title}>Login</h2>
      <div className={styles.formGroup}>
        <Input
          type="text"
          placeholder="Email"
          value={username}
          onChange={(e) => {
            logger.debug('Username field changed', {
              oldValue: username,
              newValue: e.target.value
            });
            setUsername(e.target.value);
          }}
        />
      </div>
      <div className={styles.formGroup}>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            logger.debug('Password field changed', {
              oldLength: password.length,
              newLength: e.target.value.length
            });
            setPassword(e.target.value);
          }}
        />
      </div>
      {error && (
        <div className={styles.error}>
          {typeof error === 'object' ? error.error : error}
        </div>
      )}
      <div className={styles.actions}>
        <Button onClick={handleLogin}>Login</Button>
      </div>
      <div className={styles.link}>
        No account yet?{' '}
        <button
          className={styles.linkButton}
          onClick={() => {
            logger.info('Navigating to register view');
            setView('register');
          }}
        >
          Register
        </button>
      </div>
    </Form>
  );
};

export default Login;
