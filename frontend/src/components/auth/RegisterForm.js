import React from 'react';
import PropTypes from 'prop-types';
import Form from '../ui/Form';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from '../ui/Form.module.css';

const RegisterForm = ({ onSubmit, onChange, values, children }) => {
  return (
    <Form className={styles.form} onSubmit={onSubmit}>
      <h2 className={styles.title}>Register</h2>
      <div className={styles.formGroup}>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={values.email}
          onChange={onChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={values.password}
          onChange={onChange}
          required
        />
      </div>
      <div className={styles.actions}>
        <Button type="submit">Register</Button>
      </div>
      {children}
    </Form>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  values: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string
  }).isRequired
};

export default React.memo(RegisterForm);
