import React, { useState } from 'react';
import TaskList from './components/TaskList';
import Register from './components/Register';
import Login from './components/Login';

const App = () => {
  const [view, setView] = useState('login');
  const [token, setToken] = useState(null);

  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const toggleSidePanel = () => {
    setSidePanelOpen(!sidePanelOpen);
  };
    setView('register');
  };

  const handleLoginClick = () => {
    setView('login');
  };

  const handleLogin = (token) => {
    setToken(token);
  };

  const handleLogout = () => {
    setToken(null);
    setView('login');
  };

  return (
    <div>
      {token && (
        <nav className="navbar">
          <button className="toggle-button" onClick={toggleSidePanel}>☰</button>
          <input type="text" className="search-input" placeholder="Search tasks..." />
          <div className="dropdown">
            <button className="dropdown-button">Menu</button>
            <div className="dropdown-content">
              <a href="#" onClick={handleLogout}>Logout</a>
            </div>
          </div>
        </nav>
      )}
      {!token ? (
        view === 'login' ? (
          <Login onLogin={handleLogin} setView={setView} />
        ) : (
          <Register setView={setView} />
        )
      ) : (
        <TaskList onLogout={handleLogout} token={token} />
      )}
      {sidePanelOpen && (
        <div className="side-panel">
          {/* Side panel content goes here */}
        </div>
      )}
    </div>
  );
};

export default App;

export default App;
