import React, { useState } from 'react';
import TaskList from './components/TaskList';
import Register from './components/Register';
import Login from './components/Login';

const App = () => {
  const [view, setView] = useState('login');
  const [token, setToken] = useState(null);

  const handleRegisterClick = () => {
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
          <button className="toggle-button">☰</button>
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
    </div>
  );
};

export default App;
