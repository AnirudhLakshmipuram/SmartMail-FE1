import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Upload, 
  Mail, 
  FileText,
  LogOut,
  Bot,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Configuration', href: '/configuration', icon: Settings },
  { name: 'Upload Data', href: '/upload', icon: Upload },
  { name: 'Mailbox', href: '/mailbox', icon: Mail },
  { name: 'Logs', href: '/logs', icon: FileText },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed lg:static inset-y-0 left-0 z-40 flex flex-col h-full bg-gray-900 text-white transition-transform duration-300 ease-in-out',
        'w-64 lg:w-64',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo and Brand */}
        <div className="flex items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700">
          <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mr-2 sm:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">AI Responder</h1>
            <p className="text-xs text-gray-400 truncate">Smart Email Assistant</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )
              }
            >
              <item.icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info and Logout */}
        <div className="border-t border-gray-700 p-3 sm:p-4">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-2 sm:ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              closeMobileMenu();
            }}
            className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};