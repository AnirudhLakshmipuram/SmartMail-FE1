import React, { useState, useEffect } from 'react';
import { Layout } from '../Layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { Settings, Plus, Trash2, Mail, Sliders, Save, AlertCircle, CheckCircle, Target, X, RefreshCw, ToggleLeft as Toggle, Clock, Calendar } from 'lucide-react';
import { MailboxConfig as MailboxConfigType } from '../../types';
import { apiService } from '../../services/api';

interface AutoReplyRule {
  id: string;
  email: string;
  enabled: boolean;
  categories: string[];
  confidenceThreshold: number;
  keywords: string[];
  schedule: {
    enabled: boolean;
    timezone: string;
    businessHours: {
      start: string;
      end: string;
      days: string[];
    };
  };
}

interface CategoryConfig {
  id: string;
  name: string;
  enabled: boolean;
  keywords: string[];
  template: string;
}

export const MailboxConfig: React.FC = () => {
  const { categories, mailboxConfig, loading, error, updateMailboxConfig, loadPageData } = useApp();
  
  const [config, setConfig] = useState<MailboxConfigType>({
    email: '',
    appPassword: '',
    autoReplyEmails: [],
    confidenceThreshold: 0.8,
    enabled: false
  });

  const [autoReplyRules, setAutoReplyRules] = useState<AutoReplyRule[]>([]);
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryConfig[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load mailbox config page data when component mounts
  useEffect(() => {
    console.log('⚙️ Mailbox Config page mounted - loading categories and config');
    loadPageData('mailbox-config');
    loadAutoReplyRules();
  }, []);

  // Update config when mailboxConfig is loaded
  useEffect(() => {
    if (mailboxConfig) {
      setConfig({
        email: mailboxConfig.email || '',
        appPassword: mailboxConfig.appPassword || '',
        autoReplyEmails: mailboxConfig.autoReplyEmails || [],
        confidenceThreshold: mailboxConfig.confidenceThreshold || 0.8,
        enabled: mailboxConfig.enabled || false
      });
    }
  }, [mailboxConfig]);

  // Update category configs when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      setCategoryConfigs(
        categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          enabled: true,
          keywords: ['billing', 'payment', 'invoice'], // Default keywords
          template: cat.template
        }))
      );
    }
  }, [categories]);

  const loadAutoReplyRules = async () => {
    try {
      const response = await apiService.getAutoReplyRules();
      if (response.success && response.data) {
        setAutoReplyRules(response.data.map(rule => ({
          ...rule,
          schedule: {
            ...rule.schedule,
            businessHours: {
              ...rule.schedule.business_hours,
              start: rule.schedule.business_hours.start,
              end: rule.schedule.business_hours.end,
              days: rule.schedule.business_hours.days
            }
          }
        })));
      }
    } catch (error) {
      console.error('Failed to load auto-reply rules:', error);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const success = await updateMailboxConfig(config);
      if (success) {
        setSaveMessage({ type: 'success', message: 'Configuration saved successfully!' });
        console.log('✅ Mailbox configuration saved successfully');
      } else {
        setSaveMessage({ type: 'error', message: 'Failed to save configuration. Please try again.' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'Network error. Please check your connection.' });
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const addAutoReplyEmail = async () => {
    if (newEmail && !autoReplyRules.find(rule => rule.email === newEmail)) {
      try {
        const newRule = {
          email_address: newEmail,
          enabled: true,
          categories: [],
          confidence_threshold: 0.8,
          keywords: [],
          schedule: {
            enabled: false,
            timezone: 'UTC',
            business_hours: {
              start: '09:00',
              end: '17:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
          }
        };

        const response = await apiService.createAutoReplyRule(newRule);
        if (response.success && response.data) {
          setAutoReplyRules(prev => [...prev, {
            ...response.data,
            schedule: {
              ...response.data.schedule,
              businessHours: {
                start: response.data.schedule.business_hours.start,
                end: response.data.schedule.business_hours.end,
                days: response.data.schedule.business_hours.days
              }
            }
          }]);
          setNewEmail('');
        }
      } catch (error) {
        console.error('Failed to create auto-reply rule:', error);
      }
    }
  };

  const removeAutoReplyEmail = async (id: string) => {
    try {
      const response = await apiService.deleteAutoReplyRule(id);
      if (response.success) {
        setAutoReplyRules(prev => prev.filter(rule => rule.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete auto-reply rule:', error);
    }
  };

  const toggleAutoReplyEmail = async (id: string) => {
    const rule = autoReplyRules.find(r => r.id === id);
    if (!rule) return;

    try {
      const response = await apiService.toggleAutoReplyRule(id, !rule.enabled);
      if (response.success && response.data) {
        setAutoReplyRules(prev => prev.map(r => 
          r.id === id ? { ...response.data, schedule: { ...response.data.schedule, businessHours: { ...response.data.schedule.business_hours } } } : r
        ));
      }
    } catch (error) {
      console.error('Failed to toggle auto-reply rule:', error);
    }
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

  if (loading.categories || loading.mailboxConfig) {
    return (
      <Layout title="Mailbox Configuration" subtitle="Configure auto-reply settings and email rules">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading mailbox configuration..." />
        </div>
      </Layout>
    );
  }

  if (error.categories || error.mailboxConfig) {
    const errorMessage = error.categories || error.mailboxConfig;
    return (
      <Layout title="Mailbox Configuration" subtitle="Configure auto-reply settings and email rules">
        <ErrorMessage 
          message={errorMessage || 'Failed to load configuration'} 
          onRetry={() => loadPageData('mailbox-config')}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Mailbox Configuration" subtitle="Configure auto-reply settings and email rules">
      <div className="space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Auto-Reply Configuration</h2>
            <p className="text-sm sm:text-base text-gray-600">Manage automated email response settings</p>
          </div>
          <button
            onClick={() => loadPageData('mailbox-config')}
            disabled={loading.categories || loading.mailboxConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${(loading.categories || loading.mailboxConfig) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`p-4 rounded-lg border ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {saveMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {saveMessage.message}
            </div>
          </div>
        )}

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
                  <div>
                    <span className="font-medium text-gray-900">{rule.email}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </span>
                      {rule.schedule.enabled && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>
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
            disabled={isSaving}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-medium"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};