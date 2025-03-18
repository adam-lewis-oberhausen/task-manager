import React from 'react';
import styles from './Checkbox.module.css';

const Checkbox = ({ checked, onChange }) => {
  return (
    <label className={styles.checkboxcontainer}>
      <input
        className={styles.hiddeninput}
        type="checkbox" 
        checked={checked}
        onChange={onChange}
      />
    <span className={`${styles.checkmark} ${checked ? styles.checked : ''}`}></span>
    </label>
  );
};

export default Checkbox;
