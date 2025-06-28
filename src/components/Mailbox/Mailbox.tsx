import React, { useState, useEffect } from 'react';
import { Layout } from '../Layout/Layout';
import { InboxView } from './InboxView';
import { useApp } from '../../contexts/AppContext';
import { 
  Mail, 
  Inbox, 
  Send,
  Archive,
  Trash2,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

type MailboxTab = 'inbox' | 'sent' | 'archive' | 'trash' | 'analytics';

export const Mailbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MailboxTab>('inbox');
  const { mailboxConfig, loadPageData } = useApp();

  // Load mailbox page data when component mounts
  useEffect(() => {
    console.log('📧 Mailbox page mounted - loading mailbox data');
    loadPageData('mailbox');
    loadPageData('mailbox-config');
  }, []);

  const tabs = [
    { id: 'inbox' as MailboxTab, name: 'Inbox', icon: Inbox, description: 'View and manage emails' },
    { id: 'sent' as MailboxTab, name: 'Sent', icon: Send, description: 'Sent emails' },
    { id: 'archive' as MailboxTab, name: 'Archive', icon: Archive, description: 'Archived emails' },
    { id: 'trash' as MailboxTab, name: 'Trash', icon: Trash2, description: 'Deleted emails' },
    { id: 'analytics' as MailboxTab, name: 'Analytics', icon: BarChart3, description: 'Email analytics' },
  ];

  const renderTabContent = () => {
    // Check if mailbox is configured
    if (!mailboxConfig?.email) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gmail Setup Required</h3>
            <p className="text-gray-600 mb-6">
              You need to configure your Gmail account before accessing the mailbox
            </p>
            <a
              href="/configuration"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Setup Gmail Integration
            </a>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'inbox':
        return <InboxView emailConfig={{ email: mailboxConfig.email, appPassword: mailboxConfig.appPassword }} />;
      case 'sent':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Send className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sent Emails</h3>
              <p className="text-gray-600">View your sent emails and their status</p>
            </div>
          </div>
        );
      case 'archive':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Archived Emails</h3>
              <p className="text-gray-600">Access your archived conversations</p>
            </div>
          </div>
        );
      case 'trash':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Deleted Emails</h3>
              <p className="text-gray-600">Manage your deleted emails</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Analytics</h3>
              <p className="text-gray-600">View insights and performance metrics</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout title="Mailbox" subtitle="Manage your emails and AI-powered responses">
      <div className="h-full flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto px-4 sm:px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50">
            <p className="text-xs sm:text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};