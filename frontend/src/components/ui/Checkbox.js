import React from 'react';
import './Checkbox.module.css';

const Checkbox = ({ checked, onChange }) => {
  return (
    <label className="checkbox-container">
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.Checkbox}></span>
    </label>
  );
};

export default Checkbox;
