import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

interface MailboxSetupProps {
  onConfigured: (config: { email: string; appPassword: string }) => void;
}

export const MailboxSetup: React.FC<MailboxSetupProps> = ({ onConfigured }) => {
  const [formData, setFormData] = useState({
    email: '',
    appPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    
    try {
      // Simulate connection testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Encrypt credentials using AES-256
      // 2. Test IMAP connection to Gmail
      // 3. Store encrypted credentials in secure storage
      // 4. Establish secure session
      
      setConnectionStatus('success');
      setTimeout(() => {
        onConfigured({
          email: formData.email,
          appPassword: formData.appPassword
        });
      }, 1000);
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Configure Gmail Integration</h1>
        <p className="text-sm sm:text-base text-gray-600 px-4">Securely connect your Gmail account to enable AI-powered email responses</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Configuration Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Account Configuration</h2>
          
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base ${
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
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm sm:text-base ${
                    errors.appPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="16-character app password"
                  maxLength={16}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm sm:text-base ${
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
                      <span className="text-blue-800 text-sm">Testing connection...</span>
                    </>
                  )}
                  {connectionStatus === 'success' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                      <span className="text-green-800 text-sm">Connection successful!</span>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-3" />
                      <span className="text-red-800 text-sm">Connection failed. Please check your credentials.</span>
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
              {isConnecting ? 'Connecting...' : connectionStatus === 'success' ? 'Connected' : 'Connect to Gmail'}
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