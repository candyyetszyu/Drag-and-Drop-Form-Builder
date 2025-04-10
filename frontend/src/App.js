import React from 'react';
import { Outlet } from 'react-router-dom';

// With RouterProvider, App becomes a layout component
function App() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

export default App;