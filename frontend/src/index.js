import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import DndContext from './context/DndContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DndContext>
      <App />
    </DndContext>
  </React.StrictMode>
);