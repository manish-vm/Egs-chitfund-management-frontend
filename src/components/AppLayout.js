import React from 'react';
import Side from '../pages/Side'; // your Sidebar component
import '../components/Sidebar.css'; // import the new CSS
import './AppLayout.css'; // create this CSS file for layout

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Side />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
