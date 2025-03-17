import React from 'react';
import '../styles/Checkbox.css';

const Checkbox = ({ checked, onChange }) => {
  return (
    <label className="checkbox-container">
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
      />
      <span className="checkmark"></span>
    </label>
  );
};

export default Checkbox;
