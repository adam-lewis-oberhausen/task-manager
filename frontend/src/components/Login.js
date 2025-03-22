import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import useLoginForm from '../hooks/useLoginForm';
import AuthError from './auth/AuthError';
import AuthLink from './auth/AuthLink';
import LoginForm from './auth/LoginForm';
import { createLogger } from '../utils/logger';
import styles from './ui/Form.module.css';

const logger = createLogger('LOGIN');

const Login = ({ onLogin, setView }) => {
  const { handleLogin } = useAuth(onLogin);
  const { formState, handleChange, handleSubmit } = useLoginForm(handleLogin);

  const handleRegisterClick = useCallback(() => {
    logger.info('Navigating to register view');
    setView('register');
  }, [setView]);

  return (
    <div className={styles.formContainer}>
      <LoginForm
        onSubmit={handleSubmit}
        onChange={handleChange}
        values={formState}
      >
        <AuthError error={formState.error} />
        <AuthLink
          onClick={handleRegisterClick}
          text="No account yet?"
          linkText="Register"
        />
      </LoginForm>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  setView: PropTypes.func.isRequired
};

export default React.memo(Login);
