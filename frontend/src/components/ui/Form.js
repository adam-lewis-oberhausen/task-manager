import React from 'react';
import styles from './Form.module.css';

const Form = React.forwardRef(({ children, className = '' }, ref) => {
  return (
    <div ref={ref} className={`${styles.form} ${className}`}>
      {children}
    </div>
  );
});

Form.displayName = 'Form';

export default Form;
