import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell } from 'lucide-react';

const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleNotificationClick = () => {
    // In a real app, this might show a notifications dropdown
    console.log('Notifications clicked');
    
    // Create a better notification popup
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 300px;
      ">
        <h3 style="margin: 0 0 8px 0; font-weight: 600;">🔔 Notifications</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">No new notifications</p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-top: 12px;
          background: #059669;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <header className="glass-header shadow-2xl shadow-black/5">
      <div className="px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Empty left space */}
          <div className="flex items-center">
          </div>


          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button 
              onClick={handleNotificationClick}
              className="group relative p-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-xs font-bold text-white shadow-lg animate-pulse">
                3
              </span>
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={handleUserMenuClick}
                className="group flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-white">Guest User</p>
                  <p className="text-xs text-white/60">Student</p>
                </div>
              </button>
              
              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-56 glass rounded-3xl shadow-2xl py-2 z-50 border border-white/30 animate-in slide-in-from-top-2 duration-300">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-6 py-3 text-sm text-white hover:bg-white/20 transition-all duration-200 rounded-2xl mx-2 font-medium"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Your Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-6 py-3 text-sm text-white hover:bg-white/20 transition-all duration-200 rounded-2xl mx-2 font-medium"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <div className="border-t border-white/20 my-2 mx-4"></div>
                  <button
                    onClick={() => {
                      console.log('Logout clicked');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-6 py-3 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-200 rounded-2xl mx-2 font-medium"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
