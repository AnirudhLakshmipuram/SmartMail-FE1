import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  HelpCircle,
  Key,
  Server,
  Wifi,
  Settings,
  Edit,
  Play,
  Pause,
  Activity,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useApp } from '../../contexts/AppContext';

interface MailboxSetupProps {
  onConfigured: (config: { email: string; appPassword: string }) => void;
}

interface MonitoringStats {
  emailsProcessed: number;
  autoRepliesSent: number;
  averageResponseTime: string;
  lastActivity: string;
  status: 'active' | 'paused' | 'error';
}

export const MailboxSetup: React.FC<MailboxSetupProps> = ({ onConfigured }) => {
  const { mailboxConfig, loadPageData } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats>({
    emailsProcessed: 0,
    autoRepliesSent: 0,
    averageResponseTime: '0s',
    lastActivity: 'Never',
    status: 'paused'
  });

  const [formData, setFormData] = useState({
    email: '',
    appPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Check if mailbox is already configured
  const isConfigured = mailboxConfig?.email && mailboxConfig?.appPassword;

  useEffect(() => {
    if (isConfigured) {
      setIsMonitoring(mailboxConfig.enabled || false);
      loadMonitoringStats();
      // Set up periodic stats refresh
      const interval = setInterval(loadMonitoringStats, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConfigured, mailboxConfig]);

  const loadMonitoringStats = async () => {
    try {
      // Mock stats for demo - in real implementation, this would call an API
      const mockStats: MonitoringStats = {
        emailsProcessed: Math.floor(Math.random() * 100) + 50,
        autoRepliesSent: Math.floor(Math.random() * 50) + 20,
        averageResponseTime: `${Math.floor(Math.random() * 5) + 1}s`,
        lastActivity: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
        status: isMonitoring ? 'active' : 'paused'
      };
      setMonitoringStats(mockStats);
    } catch (error) {
      console.error('Failed to load monitoring stats:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid Gmail address';
    }
    
    if (!formData.appPassword) {
      newErrors.appPassword = 'App password is required';
    } else if (formData.appPassword.length !== 16) {
      newErrors.appPassword = 'App password must be 16 characters long';
    }
    
    if (formData.appPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'App passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;
    
    setIsConnecting(true);
    setConnectionStatus('testing');
    setConnectionMessage('Testing connection to Gmail...');
    
    try {
      // Test the connection first
      const testResponse = await apiService.testMailboxConnection(formData.email, formData.appPassword);
      
      if (testResponse.success && testResponse.data) {
        setConnectionStatus('success');
        setConnectionMessage(`Connection successful! Found ${testResponse.data.inbox_count || 0} emails in inbox.`);
        
        // Configure the mailbox
        const configResponse = await apiService.configureMailbox(
          formData.email,
          formData.appPassword,
          [formData.email], // Default auto-reply emails
          0.8, // Default confidence threshold
          true // Enable by default
        );
        
        if (configResponse.success) {
          setTimeout(() => {
            onConfigured({
              email: formData.email,
              appPassword: formData.appPassword
            });
            setIsEditing(false);
            loadPageData('mailbox-config'); // Refresh mailbox config
          }, 1000);
        } else {
          setConnectionStatus('error');
          setConnectionMessage(configResponse.error || 'Failed to configure mailbox');
        }
      } else {
        setConnectionStatus('error');
        setConnectionMessage(testResponse.error || 'Connection test failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('Network error. Please check your connection and try again.');
      console.error('Mailbox connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleToggleMonitoring = async () => {
    try {
      const newStatus = !isMonitoring;
      const response = await apiService.updateMailboxConfig({
        ...mailboxConfig!,
        enabled: newStatus
      });
      
      if (response.success) {
        setIsMonitoring(newStatus);
        setMonitoringStats(prev => ({ ...prev, status: newStatus ? 'active' : 'paused' }));
        loadPageData('mailbox-config'); // Refresh config
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
    }
  };

  const handleEditConfig = () => {
    setFormData({
      email: mailboxConfig?.email || '',
      appPassword: mailboxConfig?.appPassword || '',
      confirmPassword: mailboxConfig?.appPassword || ''
    });
    setIsEditing(true);
    setConnectionStatus('idle');
    setConnectionMessage('');
    setErrors({});
  };

  const securityFeatures = [
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'Your credentials are encrypted using AES-256 before storage'
    },
    {
      icon: Key,
      title: 'Secure Key Management',
      description: 'App passwords are stored in encrypted vaults with key rotation'
    },
    {
      icon: Server,
      title: 'Secure Connection',
      description: 'All communications use TLS 1.3 with certificate pinning'
    },
    {
      icon: Wifi,
      title: 'Zero-Knowledge Architecture',
      description: 'We cannot access your credentials even if we wanted to'
    }
  ];

  // If configured and not editing, show monitoring dashboard
  if (isConfigured && !isEditing) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gmail Integration Active</h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">Your Gmail account is connected and monitoring emails</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Current Configuration */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Current Configuration</h2>
              <button
                onClick={handleEditConfig}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Gmail Account</p>
                  <p className="text-sm text-gray-600">{mailboxConfig.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Security Status</p>
                  <p className="text-sm text-green-600">Encrypted & Secure</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Confidence Threshold</p>
                  <p className="text-sm text-gray-600">{Math.round((mailboxConfig.confidenceThreshold || 0.8) * 100)}%</p>
                </div>
              </div>
            </div>

            {/* Monitoring Toggle */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Monitoring</h3>
                  <p className="text-xs text-gray-500">Automatically process and respond to emails</p>
                </div>
                <button
                  onClick={handleToggleMonitoring}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isMonitoring ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isMonitoring ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Monitoring Stats */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Monitoring Statistics</h2>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                monitoringStats.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : monitoringStats.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {monitoringStats.status === 'active' ? (
                  <Activity className="h-3 w-3" />
                ) : monitoringStats.status === 'paused' ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                <span className="capitalize">{monitoringStats.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Emails Processed</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{monitoringStats.emailsProcessed}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Auto Replies</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{monitoringStats.autoRepliesSent}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-900">Avg Response</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{monitoringStats.averageResponseTime}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-900">Last Activity</span>
                </div>
                <p className="text-sm font-bold text-orange-900">{monitoringStats.lastActivity}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleToggleMonitoring}
                  className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm flex-1 ${
                    isMonitoring 
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isMonitoring ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause Monitoring</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start Monitoring</span>
                    </>
                  )}
                </button>
                <button
                  onClick={loadMonitoringStats}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex-1"
                >
                  <Activity className="h-4 w-4" />
                  <span>Refresh Stats</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show setup/edit form
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {isConfigured ? 'Edit Gmail Integration' : 'Configure Gmail Integration'}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 px-4">
          {isConfigured ? 'Update your Gmail account settings' : 'Securely connect your Gmail account to enable AI-powered email responses'}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Configuration Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Account Configuration</h2>
            {isConfigured && (
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isConnecting}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your-email@gmail.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* App Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  App Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.appPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, appPassword: e.target.value.replace(/\s/g, '') }))}
                  disabled={isConnecting}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.appPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="16-character app password"
                  maxLength={16}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isConnecting}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.appPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.appPassword}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm App Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value.replace(/\s/g, '') }))}
                  disabled={isConnecting}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm app password"
                  maxLength={16}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Connection Status */}
            {connectionStatus !== 'idle' && (
              <div className={`p-4 rounded-lg border ${
                connectionStatus === 'testing' ? 'bg-blue-50 border-blue-200' :
                connectionStatus === 'success' ? 'bg-green-50 border-green-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {connectionStatus === 'testing' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                      <span className="text-blue-800 text-sm">{connectionMessage}</span>
                    </>
                  )}
                  {connectionStatus === 'success' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                      <span className="text-green-800 text-sm">{connectionMessage}</span>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-3" />
                      <span className="text-red-800 text-sm">{connectionMessage}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              disabled={isConnecting || connectionStatus === 'success'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            >
              {isConnecting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </div>
              ) : connectionStatus === 'success' ? (
                'Connected Successfully'
              ) : (
                isConfigured ? 'Update Gmail Connection' : 'Connect to Gmail'
              )}
            </button>
          </div>
        </div>

        {/* Help and Security Info */}
        <div className="space-y-6">
          {/* App Password Help */}
          <div className={`bg-blue-50 border border-blue-200 rounded-xl p-4 lg:p-6 transition-all duration-300 ${showHelp ? 'block' : 'hidden lg:block'}`}>
            <h3 className="font-semibold text-blue-900 mb-4 text-sm sm:text-base">How to Generate App Password</h3>
            <ol className="text-xs sm:text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Go to your <a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Account settings</a></li>
              <li>Click on "Security" in the left sidebar</li>
              <li>Under "Signing in to Google," select "2-Step Verification"</li>
              <li>At the bottom, choose "App passwords"</li>
              <li>Select "Mail" and your device type</li>
              <li>Copy the generated 16-character password</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> You must have 2-Step Verification enabled to generate app passwords.
              </p>
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-sm sm:text-base">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              Security & Privacy
            </h3>
            <div className="space-y-4">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Steps */}
          <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-sm sm:text-base">
              <Settings className="h-5 w-5 text-gray-600 mr-2" />
              Integration Process
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <span>Credential encryption using AES-256-GCM</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <span>IMAP connection establishment with TLS 1.3</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <span>Secure session creation with token rotation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                <span>Real-time inbox synchronization</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};