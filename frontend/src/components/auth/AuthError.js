import React from 'react';
import PropTypes from 'prop-types';
import styles from '../ui/Form.module.css';

const AuthError = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className={styles.error}>
      {typeof error === 'object' ? error.error : error}
    </div>
  );
};

AuthError.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ])
};

export default React.memo(AuthError);
