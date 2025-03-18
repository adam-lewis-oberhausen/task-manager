import React from 'react';                                                                                         
import styles from './Input.module.css';                                                                           
                                                                                                                   
const Input = ({                                                                                                   
  type = 'text',                                                                                                   
  placeholder = '',                                                                                                
  value,                                                                                                           
  onChange,                                                                                                        
  className = '',                                                                                                  
  ...props                                                                                                         
}) => {                                                                                                            
  return (                                                                                                         
    <input                                                                                                         
      type={type}                                                                                                  
      className={`${styles.input} ${className}`}                                                                   
      placeholder={placeholder}                                                                                    
      value={value}                                                                                                
      onChange={onChange}                                                                                          
      {...props}                                                                                                   
    />                                                                                                             
  );                                                                                                               
};                                                                                                                 
                                                                                                                   
export default Input;