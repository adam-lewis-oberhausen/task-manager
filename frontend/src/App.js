import React from 'react';
import TaskList from './components/TaskList';
import './styles/App.css';

const App = () => {
  return (
    <div className="container">
      <div className="sticky-form">
        <TaskList />
      </div>
    </div>
  );
};

export default App;