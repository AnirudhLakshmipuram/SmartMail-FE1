import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Upload, 
  Mail, 
  MailSearch, 
  FileText,
  LogOut,
  Bot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Configuration', href: '/configuration', icon: Settings },
  { name: 'Upload Data', href: '/upload', icon: Upload },
  { name: 'Mailbox', href: '/mailbox', icon: Mail },
  { name: 'Mailbox Config', href: '/mailbox-config', icon: MailSearch },
  { name: 'Logs', href: '/logs', icon: FileText },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      {/* Logo and Brand */}
      <div className="flex items-center px-6 py-5 border-b border-gray-700">
        <Bot className="h-8 w-8 text-blue-400 mr-3" />
        <div>
          <h1 className="text-xl font-bold">AI Responder</h1>
          <p className="text-xs text-gray-400">Smart Email Assistant</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info and Logout */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};