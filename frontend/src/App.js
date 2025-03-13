import React, { useState } from 'react';
import TaskList from './components/TaskList';
import Register from './components/Register';
import Login from './components/Login';

const App = () => {
  const [token, setToken] = useState(null);

  const handleLogin = (token) => {
    setToken(token);
  };

  return (
    <div>
      {!token ? (
        <>
          <Register />
          <Login onLogin={handleLogin} />
        </>
      ) : (
        <TaskList />
      )}
    </div>
  );
};

export default App;
