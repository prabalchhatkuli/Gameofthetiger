import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import UserProvider from "./providers/UserProvider";

// Render primary component for the app
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
