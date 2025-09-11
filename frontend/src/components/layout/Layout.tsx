import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import EmergencyButton from '../ui/EmergencyButton';

const Layout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col relative">
      {/* Header */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:pl-64 overflow-y-auto">
          <div className="py-12 px-6 sm:px-8 lg:px-12 relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Emergency Button - Fixed positioned */}
      <EmergencyButton />
    </div>
  );
};

export default Layout;
