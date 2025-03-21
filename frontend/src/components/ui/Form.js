import React from 'react';
import styles from './Form.module.css';

const Form = React.forwardRef(({ children, className = '', onSubmit }, ref) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      ref={ref}
      className={`${styles.form} ${className}`}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
});

Form.displayName = 'Form';

export default Form; 
