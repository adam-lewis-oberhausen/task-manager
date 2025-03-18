import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, className = '', icon: Icon }) => {
  return (
    <button 
      className={`${styles.button} ${className}`}
      onClick={onClick}
    >
      {Icon && <span className={styles.iconWrapper}><Icon className={styles.icon} /></span>}
      {children}
    </button>
  );
};

export default Button;
