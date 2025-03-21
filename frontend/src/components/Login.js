import React, { useState, useRef } from 'react';
import axios from '../services/axiosConfig';
import Form from './ui/Form';
import Input from './ui/Input';
import Button from './ui/Button';
import styles from './ui/Form.module.css';
import { createLogger } from '../utils/logger';
const logger = createLogger('LOGIN');

const Login = ({ onLogin, setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const formRef = useRef(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Trigger form validation
    if (formRef.current.reportValidity()) {
      handleLogin();
    }
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit} ref={formRef}>
      <h2 className={styles.title}>Login</h2>
      <div className={styles.formGroup}>
        <Input
          type="email"
          placeholder="Email"
          value={username}
          onChange={(e) => {
            logger.debug('Username field changed', {
              oldValue: username,
              newValue: e.target.value
            });
            setUsername(e.target.value);
          }}
          required
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
          required
        />
      </div>
      {error && (
        <div className={styles.error}>
          {typeof error === 'object' ? error.error : error}
        </div>
      )}
      <div className={styles.actions}>
        <Button type="submit">Login</Button>
      </div>
      <div className={styles.link}>
        No account yet?{' '}
        <button
          type="button"
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
