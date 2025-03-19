import React, { useState } from 'react';
import axios from '../services/axiosConfig';
import Form from './ui/Form';
import Input from './ui/Input';
import Button from './ui/Button';
import styles from './ui/Form.module.css';

const Register = ({ setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    // Normalize inputs
    const normalizedEmail = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Validate email
    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(normalizedPassword)) {
      setError('Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.');
      return;
    }

    try {
      await axios.post('/api/auth/register', {
        email: normalizedEmail,
        password: normalizedPassword
      });
      setView('login');
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
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
          onClick={() => setView('login')}
        >
          Login
        </button>
      </div>
    </Form>
  );
};

export default Register;
