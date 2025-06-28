import React from 'react';
import { Layout } from '../Layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { 
  Mail, 
  FileText, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Bot
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { emails, categories, documents, logs } = useApp();

  const stats = [
    {
      name: 'Total Emails',
      value: emails.length,
      change: '+12%',
      changeType: 'positive',
      icon: Mail,
      color: 'bg-blue-500',
    },
    {
      name: 'Categories',
      value: categories.length,
      change: '+2',
      changeType: 'positive',
      icon: Settings,
      color: 'bg-purple-500',
    },
    {
      name: 'Documents',
      value: documents.length,
      change: '0',
      changeType: 'neutral',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Success Rate',
      value: '85%',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const recentEmails = emails.slice(0, 5);
  const recentLogs = logs.slice(0, 5);

  return (
    <Layout title="Dashboard" subtitle="Monitor your email automation performance">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                      stat.changeType === 'positive' 
                        ? 'bg-green-100 text-green-800' 
                        : stat.changeType === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Emails */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Emails</h3>
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {recentEmails.length > 0 ? (
                <div className="space-y-4">
                  {recentEmails.map((email) => (
                    <div key={email.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-full ${
                        email.status === 'sent' ? 'bg-green-100' :
                        email.status === 'pending' ? 'bg-yellow-100' :
                        email.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {email.status === 'sent' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                         email.status === 'pending' ? <Clock className="h-4 w-4 text-yellow-600" /> :
                         email.status === 'failed' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                         <Bot className="h-4 w-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {email.subject}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          From: {email.from}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400">
                            {email.receivedAt.toLocaleTimeString()}
                          </span>
                          <span className="ml-2 text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {Math.round(email.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No emails yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-full ${
                        log.type === 'sent' ? 'bg-green-100' :
                        log.type === 'failed' ? 'bg-red-100' :
                        log.type === 'pending' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        {log.type === 'sent' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                         log.type === 'failed' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                         log.type === 'pending' ? <Clock className="h-4 w-4 text-yellow-600" /> :
                         <Bot className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {log.action}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {log.email} - {log.subject}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <span className="ml-2 text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            {Math.round(log.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No activity yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <Settings className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Add Category</p>
              <p className="text-sm text-gray-500">Create new email categories</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group">
              <FileText className="h-6 w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Upload Documents</p>
              <p className="text-sm text-gray-500">Add company knowledge base</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group">
              <Mail className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Configure Mailbox</p>
              <p className="text-sm text-gray-500">Set up email integration</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};