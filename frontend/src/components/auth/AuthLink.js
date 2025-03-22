import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import styles from '../ui/Form.module.css';

const AuthLink = ({ onClick, text, linkText }) => {
  return (
    <div className={styles.link}>
      {text}{' '}
      <Button
        type="button"
        className={styles.linkButton}
        onClick={onClick}
        variant="text"
      >
        {linkText}
      </Button>
    </div>
  );
};

AuthLink.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired
};

export default React.memo(AuthLink);
