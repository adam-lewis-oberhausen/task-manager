import React, { useState, useEffect, useRef } from 'react';
import TaskList from './components/tasks/TaskList';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/ui/Navbar';
import { WorkspaceProvider } from './context/WorkspaceContext';
import './styles/App.css';
import { createLogger } from './utils/logger';
const logger = createLogger('APP');

const App = () => {
  const [view, setView] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const toggleSidePanel = () => {
    const newState = !sidePanelOpen;
    logger.info(`Side panel ${newState ? 'opened' : 'closed'}`);
    setSidePanelOpen(newState);
  };

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      if (token) {
        logger.info('Token detected, setting view to tasks');
        setView('tasks');
      } else {
        logger.info('No token detected, setting view to login');
        setView('login');
      }
    } else {
      isMounted.current = true;
    }
  }, [token]);

  const handleLogin = (token) => {
    logger.info('User logged in');
    localStorage.setItem('token', token);
    setToken(token);
    setView('main');
  };

  const handleLogout = () => {
    logger.info('User logged out');
    localStorage.removeItem('token');
    setToken(null);
    setView('login');
  };

  return (
    <div>
      {token ? (
        <WorkspaceProvider token={token}>
          <Navbar
            onToggleSidePanel={toggleSidePanel}
            onLogout={handleLogout}
          />
          <div style={{ display: 'flex' }}>
            <div className={`content ${sidePanelOpen ? 'shifted' : ''}`}>
              <TaskList onLogout={handleLogout} token={token} />
              {sidePanelOpen && (
                <div className="side-panel">
                  {/* Side panel content goes here */}
                </div>
              )}
            </div>
          </div>
        </WorkspaceProvider>
      ) : (
        <div className={`content ${sidePanelOpen ? 'shifted' : ''}`}>
          {view === 'login' && (
            <>
              {logger.debug('Rendering login view')}
              <Login onLogin={handleLogin} setView={setView} />
            </>
          )}
          {view === 'register' && (
            <>
              {logger.debug('Rendering register view')}
              <Register onLogin={handleLogin} setView={setView} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
