import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  AlertTriangle,
  User,
  Sparkles,
  Gamepad2,
  BookOpen
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Mood Tracker', href: '/mood', icon: Brain },
  { name: 'AI Insights', href: '/insights', icon: Sparkles },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Emergency', href: '/emergency', icon: AlertTriangle },
  { name: 'Profile', href: '/profile', icon: User },
];

const Sidebar: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
      <div className="flex grow flex-col gap-y-6 glass-sidebar px-6 pt-20 overflow-y-auto">
        {/* Sidebar Header */}
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow p-3 shadow-2xl">
            <img 
              src="/logo-header.svg" 
              alt="Aashray Logo" 
              className="w-full h-full object-contain filter brightness-110 contrast-110"
              onError={(e) => {
                console.log('Sidebar logo failed to load');
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>';
                }
              }}
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">आश्रय</h2>
          <p className="text-sm text-white/70 font-medium">Your mental health journey</p>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const gradients = {
                'Dashboard': 'from-blue-500 to-cyan-500',
                'Mood Tracker': 'from-pink-500 to-rose-500',
                'AI Insights': 'from-purple-500 to-violet-500',
                'Games': 'from-orange-500 to-red-500',
                'Resources': 'from-emerald-500 to-teal-500',
                'Emergency': 'from-red-500 to-pink-500',
                'Profile': 'from-indigo-500 to-blue-500'
              };
              const gradient = gradients[item.name as keyof typeof gradients] || 'from-gray-500 to-gray-600';
              
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-x-4 rounded-2xl p-4 text-sm font-semibold transition-all duration-300 overflow-hidden ${
                        isActive
                          ? `bg-gradient-to-r ${gradient} text-white shadow-2xl shadow-${gradient.split('-')[1]}-500/50 scale-105 border border-white/20`
                          : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 hover:shadow-xl'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20 blur animate-pulse`}></div>
                        )}
                        <div className="relative z-10 flex items-center gap-x-4 w-full">
                          <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/20'} transition-colors duration-300`}>
                            <Icon className="h-5 w-5 shrink-0" />
                          </div>
                          <span className="truncate">{item.name}</span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          
          {/* Bottom section */}
          <div className="mt-auto pb-6">
            <div className="glass rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-white/80 font-medium">All systems online</p>
              <p className="text-xs text-white/60">Ready to help</p>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
