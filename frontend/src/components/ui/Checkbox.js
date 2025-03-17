import React from 'react';
import styles from './Checkbox.module.css';

const Checkbox = ({ checked, onChange }) => {
  return (
    <label className={styles.checkboxContainer}>
      <input
        className={styles.checkmark}
        type="checkbox" 
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
};

export default Checkbox;
