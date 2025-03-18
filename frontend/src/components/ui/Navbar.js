import React from 'react';                                                                                         
import Button from './Button';
import Input from './Input';                                                                                    
import styles from './Navbar.module.css';
import stylesInput from './Input.module.css';                                                                         
                                                                                                                   
const Navbar = ({ onToggleSidePanel, onLogout }) => {                                                              
  return (                                                                                                         
    <nav className={styles.navbar}>                                                                                
      <Button                                                                                                      
        onClick={onToggleSidePanel}                                                                                
        className={styles.toggleButton}                                                                            
      >                                                                                                            
        ☰                                                                                                          
      </Button>                                                                                                    
      <Input                                                                                                       
        type="text"                                                                                                
        className={stylesInput.searchInput}                                                                             
        placeholder="Search tasks..."                                                                              
      />                                                                                                           
      <div className={styles.dropdown}>                                                                            
        <Button className={styles.dropdownButton}>Menu</Button>                                                    
        <div className={styles.dropdownContent}>                                                                   
          <Button                                                                                                  
            className={styles.dropdownLink}                                                                        
            onClick={onLogout}                                                                                     
          >                                                                                                        
            Logout                                                                                                 
          </Button>                                                                                                
        </div>                                                                                                     
      </div>                                                                                                       
    </nav>                                                                                                         
  );                                                                                                               
};                                                                                                                 
                                                                                                                   
export default Navbar;