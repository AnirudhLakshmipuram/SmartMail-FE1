import React, { useState } from 'react';
import { Layout } from '../Layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { Settings, Plus, Trash2, Mail, Sliders, ToggleLeft as Toggle, Save, AlertCircle, CheckCircle, Target, X } from 'lucide-react';
import { MailboxConfig as MailboxConfigType } from '../../types';

interface AutoReplyRule {
  id: string;
  email: string;
  enabled: boolean;
}

interface CategoryConfig {
  id: string;
  name: string;
  enabled: boolean;
  keywords: string[];
  template: string;
}

export const MailboxConfig: React.FC = () => {
  const { categories, mailboxConfig, updateMailboxConfig } = useApp();
  
  const [config, setConfig] = useState<MailboxConfigType>({
    email: mailboxConfig?.email || '',
    appPassword: mailboxConfig?.appPassword || '',
    autoReplyEmails: mailboxConfig?.autoReplyEmails || [],
    confidenceThreshold: mailboxConfig?.confidenceThreshold || 0.8,
    enabled: mailboxConfig?.enabled || false
  });

  const [autoReplyRules, setAutoReplyRules] = useState<AutoReplyRule[]>([
    { id: '1', email: 'support@company.com', enabled: true },
    { id: '2', email: 'sales@company.com', enabled: false },
  ]);

  const [categoryConfigs, setCategoryConfigs] = useState<CategoryConfig[]>(
    categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      enabled: true,
      keywords: ['billing', 'payment', 'invoice'],
      template: cat.template
    }))
  );

  const [newEmail, setNewEmail] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleSaveConfig = () => {
    updateMailboxConfig(config);
    // Show success message
  };

  const addAutoReplyEmail = () => {
    if (newEmail && !autoReplyRules.find(rule => rule.email === newEmail)) {
      const newRule: AutoReplyRule = {
        id: Date.now().toString(),
        email: newEmail,
        enabled: true
      };
      setAutoReplyRules(prev => [...prev, newRule]);
      setNewEmail('');
    }
  };

  const removeAutoReplyEmail = (id: string) => {
    setAutoReplyRules(prev => prev.filter(rule => rule.id !== id));
  };

  const toggleAutoReplyEmail = (id: string) => {
    setAutoReplyRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const addKeyword = (categoryId: string) => {
    if (newKeyword) {
      setCategoryConfigs(prev => prev.map(config => 
        config.id === categoryId 
          ? { ...config, keywords: [...config.keywords, newKeyword] }
          : config
      ));
      setNewKeyword('');
    }
  };

  const removeKeyword = (categoryId: string, keyword: string) => {
    setCategoryConfigs(prev => prev.map(config => 
      config.id === categoryId 
        ? { ...config, keywords: config.keywords.filter(k => k !== keyword) }
        : config
    ));
  };

  const toggleCategory = (categoryId: string) => {
    setCategoryConfigs(prev => prev.map(config => 
      config.id === categoryId ? { ...config, enabled: !config.enabled } : config
    ));
  };

  return (
    <Layout title="Mailbox Configuration" subtitle="Configure auto-reply settings and email rules">
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Global Settings</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Auto-reply enabled</span>
              <button
                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confidence Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Confidence Threshold
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Sliders className="h-5 w-5 text-gray-400" />
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={config.confidenceThreshold}
                    onChange={(e) => setConfig(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                    {Math.round(config.confidenceThreshold * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Only send auto-replies when AI confidence is above this threshold
                </p>
              </div>
            </div>

            {/* Email Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Email
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="your-email@company.com"
              />
            </div>
          </div>
        </div>

        {/* Auto-Reply Email Addresses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Auto-Reply Email Addresses</h3>
            <span className="text-sm text-gray-500">{autoReplyRules.filter(r => r.enabled).length} active</span>
          </div>

          {/* Add New Email */}
          <div className="flex space-x-3 mb-6">
            <div className="flex-1">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Add email address for auto-reply"
              />
            </div>
            <button
              onClick={addAutoReplyEmail}
              disabled={!newEmail}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Email List */}
          <div className="space-y-3">
            {autoReplyRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{rule.email}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rule.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAutoReplyEmail(rule.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      rule.enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => removeAutoReplyEmail(rule.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Auto-Reply Settings</h3>
          
          <div className="space-y-6">
            {categoryConfigs.map((categoryConfig) => {
              const category = categories.find(c => c.id === categoryConfig.id);
              return (
                <div key={categoryConfig.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`${category?.color || 'bg-gray-500'} p-2 rounded-lg`}>
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{categoryConfig.name}</h4>
                        <p className="text-sm text-gray-500">Auto-reply for {categoryConfig.name.toLowerCase()} queries</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCategory(categoryConfig.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        categoryConfig.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          categoryConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {categoryConfig.enabled && (
                    <div className="space-y-4">
                      {/* Keywords */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trigger Keywords
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {categoryConfig.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {keyword}
                              <button
                                onClick={() => removeKeyword(categoryConfig.id, keyword)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={selectedCategory === categoryConfig.id ? newKeyword : ''}
                            onChange={(e) => {
                              setNewKeyword(e.target.value);
                              setSelectedCategory(categoryConfig.id);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            placeholder="Add keyword"
                          />
                          <button
                            onClick={() => addKeyword(categoryConfig.id)}
                            disabled={!newKeyword || selectedCategory !== categoryConfig.id}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Template Preview */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Response Template
                        </label>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{categoryConfig.template}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Configuration */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveConfig}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <Save className="h-5 w-5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};