import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from '../ui/Form.module.css';

const AuthLink = ({ onClick, text, linkText }) => {
  const handleClick = useCallback((e) => {
    e.preventDefault();
    onClick();
  }, [onClick]);

  return (
    <div className={styles.link}>
      {text}{' '}
      <button
        type="button"
        className={styles.linkButton}
        onClick={handleClick}
      >
        {linkText}
      </button>
    </div>
  );
};

AuthLink.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired
};

export default React.memo(AuthLink);
