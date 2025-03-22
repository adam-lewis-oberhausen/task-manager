import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import useRegisterForm from '../hooks/useRegisterForm';
import AuthError from './auth/AuthError';
import AuthLink from './auth/AuthLink';
import RegisterForm from './auth/RegisterForm';
import { createLogger } from '../utils/logger';
import styles from './ui/Form.module.css';

const logger = createLogger('REGISTER');

const Register = ({ onLogin, setView }) => {
  const { handleRegister } = useAuth(onLogin);
  const { formState, handleChange, handleSubmit } = useRegisterForm(handleRegister);

  const handleLoginClick = useCallback(() => {
    logger.info('Navigating to login view');
    setView('login');
  }, [setView]);

  return (
    <div className={styles.formContainer}>
      <RegisterForm
        onSubmit={handleSubmit}
        onChange={handleChange}
        values={formState}
      >
        <AuthError error={formState.error} />
        <AuthLink
          onClick={handleLoginClick}
          text="Already have an account?"
          linkText="Login"
        />
      </RegisterForm>
    </div>
  );
};

Register.propTypes = {
  onLogin: PropTypes.func.isRequired,
  setView: PropTypes.func.isRequired
};

export default React.memo(Register);
