import React, { useState, useEffect } from 'react';
import axios from '../services/axiosConfig';
import Form from './ui/Form';
import Input from './ui/Input';
import Button from './ui/Button';
import styles from './ui/Form.module.css';
import { createLogger } from '../utils/logger';
const logger = createLogger('REGISTER');

const Register = ({ setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    logger.info('Registration attempt initiated');
    setError('');

    // Normalize inputs
    const normalizedEmail = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    logger.debug('Registration credentials normalized', {
      email: normalizedEmail,
      passwordLength: normalizedPassword.length
    });

    // Validate email
    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      const errorMsg = 'Please enter a valid email address.';
      logger.warn('Email validation failed', {
        email: normalizedEmail,
        error: errorMsg
      });
      setError(errorMsg);
      return;
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(normalizedPassword)) {
      const errorMsg = 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.';
      logger.warn('Password validation failed', {
        passwordLength: normalizedPassword.length,
        error: errorMsg
      });
      setError(errorMsg);
      return;
    }

    try {
      logger.info('Attempting registration');
      await axios.post('/api/auth/register', {
        email: normalizedEmail,
        password: normalizedPassword
      });
      logger.info('Registration successful');
      logger.debug('Navigating to login view');
      setView('login');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      logger.error('Registration failed', {
        error: errorMsg,
        status: error.response?.status
      });
      setError(errorMsg);
    }
  };

  return (
    <Form className={styles.form}>
      <h2 className={styles.title}>Register</h2>
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
        <Button onClick={handleRegister}>Register</Button>
      </div>
      <div className={styles.link}>
        Already have an account?{' '}
        <button
          className={styles.linkButton}
          onClick={() => {
            logger.info('Navigating to login view');
            setView('login');
          }}
        >
          Login
        </button>
      </div>
    </Form>
  );
};

export default Register;
