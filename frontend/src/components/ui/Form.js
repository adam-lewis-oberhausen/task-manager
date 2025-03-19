import React from 'react';
import styles from './Form.module.css';

const Form = ({ children, className = '' }) => {
  return (
    <div className={`${styles.form} ${className}`}>
      {children}
    </div>
  );
};

export default Form;
