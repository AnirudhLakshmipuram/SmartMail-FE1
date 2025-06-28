import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Filter, 
  RefreshCw, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  Forward, 
  MoreHorizontal,
  Paperclip,
  Flag,
  Clock,
  Send,
  Edit,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Tag,
  Menu,
  X
} from 'lucide-react';

interface EmailMessage {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  priority: 'high' | 'normal' | 'low';
  category?: string;
  thread: EmailMessage[];
  labels: string[];
}

interface AIResponse {
  suggestion: string;
  confidence: number;
  category: string;
  tone: string;
  reasoning: string;
}

interface InboxViewProps {
  emailConfig: { email: string; appPassword: string };
}

export const InboxView: React.FC<InboxViewProps> = ({ emailConfig }) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'starred' | 'important'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showEmailList, setShowEmailList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock email data - in real implementation, this would come from Gmail API
  useEffect(() => {
    const mockEmails: EmailMessage[] = [
      {
        id: '1',
        from: 'customer@techcorp.com',
        fromName: 'Sarah Johnson',
        to: emailConfig.email,
        subject: 'Urgent: Payment processing issue with invoice #INV-2024-001',
        body: 'Hi there,\n\nWe\'re experiencing difficulties processing payment for invoice #INV-2024-001. The payment gateway is returning an error code 4001. Could you please help us resolve this issue as soon as possible?\n\nBest regards,\nSarah Johnson\nAccounts Payable\nTechCorp Solutions',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        isRead: false,
        isStarred: false,
        hasAttachments: true,
        priority: 'high',
        category: 'Customer Support',
        thread: [],
        labels: ['billing', 'urgent']
      },
      {
        id: '2',
        from: 'marketing@startup.io',
        fromName: 'Mike Chen',
        to: emailConfig.email,
        subject: 'Partnership opportunity - AI integration',
        body: 'Hello,\n\nI hope this email finds you well. We\'re reaching out regarding a potential partnership opportunity. Our startup specializes in AI-powered customer service solutions, and we believe there could be great synergy between our companies.\n\nWould you be available for a brief call next week to discuss this further?\n\nBest,\nMike Chen\nBusiness Development\nStartup.io',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isRead: true,
        isStarred: true,
        hasAttachments: false,
        priority: 'normal',
        category: 'Business Development',
        thread: [],
        labels: ['partnership', 'ai']
      },
      {
        id: '3',
        from: 'support@cloudservice.com',
        fromName: 'CloudService Support',
        to: emailConfig.email,
        subject: 'Your monthly usage report is ready',
        body: 'Dear valued customer,\n\nYour monthly usage report for December 2024 is now available in your dashboard. This month you used 85% of your allocated resources.\n\nKey highlights:\n- API calls: 45,230\n- Storage: 12.3 GB\n- Bandwidth: 156 GB\n\nThank you for choosing CloudService.\n\nBest regards,\nCloudService Team',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isRead: true,
        isStarred: false,
        hasAttachments: false,
        priority: 'low',
        category: 'Notifications',
        thread: [],
        labels: ['reports', 'monthly']
      }
    ];

    setTimeout(() => {
      setEmails(mockEmails);
      setIsLoading(false);
    }, 1000);
  }, [emailConfig.email]);

  const generateAIResponse = async (email: EmailMessage) => {
    setIsGeneratingAI(true);
    setShowAIPanel(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI response based on email content
    let mockResponse: AIResponse;
    
    if (email.subject.toLowerCase().includes('payment') || email.subject.toLowerCase().includes('invoice')) {
      mockResponse = {
        suggestion: `Dear ${email.fromName},\n\nThank you for reaching out regarding the payment processing issue with invoice #INV-2024-001.\n\nI understand the urgency of this matter and I'm here to help resolve it quickly. Error code 4001 typically indicates a temporary gateway issue. I've escalated this to our payment processing team and they're investigating immediately.\n\nIn the meantime, I've also sent you an alternative payment link that should work around this issue. You should receive it within the next 10 minutes.\n\nI'll keep you updated on the progress and ensure this is resolved today. Please don't hesitate to reach out if you have any questions.\n\nBest regards,\n[Your Name]\nCustomer Success Team`,
        confidence: 0.92,
        category: 'Customer Support',
        tone: 'Professional & Urgent',
        reasoning: 'High confidence due to clear payment issue context. Used urgent but professional tone to match the customer\'s concern level.'
      };
    } else if (email.subject.toLowerCase().includes('partnership')) {
      mockResponse = {
        suggestion: `Hi Mike,\n\nThank you for reaching out about the partnership opportunity. AI-powered customer service solutions are definitely an area of interest for us.\n\nI'd be happy to schedule a call next week to explore potential synergies between our companies. Could you share a bit more about your specific AI capabilities and what type of partnership structure you have in mind?\n\nI'm available Tuesday through Thursday next week, preferably in the afternoon. Please let me know what works best for your schedule.\n\nLooking forward to our conversation.\n\nBest regards,\n[Your Name]\nBusiness Development`,
        confidence: 0.87,
        category: 'Business Development',
        tone: 'Professional & Interested',
        reasoning: 'Good confidence for partnership inquiry. Balanced professional tone showing interest while requesting more details.'
      };
    } else {
      mockResponse = {
        suggestion: `Dear CloudService Team,\n\nThank you for the monthly usage report. It's helpful to see the detailed breakdown of our resource consumption.\n\nI notice we're at 85% of our allocated resources. Could you please provide information about upgrading our plan or optimizing our current usage?\n\nBest regards,\n[Your Name]`,
        confidence: 0.75,
        category: 'General',
        tone: 'Professional',
        reasoning: 'Moderate confidence for general inquiry. Standard professional response acknowledging the report.'
      };
    }
    
    setAiResponse(mockResponse);
    setReplyText(mockResponse.suggestion);
    setIsGeneratingAI(false);
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'unread' && !email.isRead) ||
                         (filterBy === 'starred' && email.isStarred) ||
                         (filterBy === 'important' && email.priority === 'high');
    
    return matchesSearch && matchesFilter;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flag className="h-4 w-4 text-red-500" />;
      case 'low': return <Flag className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSendReply = () => {
    // In real implementation, this would send the email via Gmail API
    console.log('Sending reply:', replyText);
    // Reset the reply panel
    setReplyText('');
    setAiResponse(null);
    setShowAIPanel(false);
    // Update email status, add to logs, etc.
  };

  const handleEmailSelect = (email: EmailMessage) => {
    setSelectedEmail(email);
    if (isMobile) {
      setShowEmailList(false);
    }
  };

  const handleBackToList = () => {
    setShowEmailList(true);
    setSelectedEmail(null);
    setShowAIPanel(false);
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Email List Panel */}
      <div className={`${
        isMobile 
          ? showEmailList ? 'w-full' : 'hidden' 
          : showAIPanel ? 'w-1/4' : 'w-1/3'
      } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* Search and Filter Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="Search emails..."
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
            {['all', 'unread', 'starred', 'important'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter as any)}
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                  filterBy === filter
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailSelect(email)}
                  className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  } ${!email.isRead ? 'bg-blue-25' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                        {email.fromName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {email.fromName}
                        </p>
                        <p className="text-xs text-gray-500 truncate hidden sm:block">{email.from}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                      {email.isStarred && <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />}
                      {getPriorityIcon(email.priority)}
                      <span className="text-xs text-gray-400">{formatTimestamp(email.timestamp)}</span>
                    </div>
                  </div>
                  
                  <h4 className={`text-sm mb-1 truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {email.subject}
                  </h4>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {email.body}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {email.hasAttachments && (
                        <Paperclip className="h-3 w-3 text-gray-400" />
                      )}
                      {email.category && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full hidden sm:inline">
                          {email.category}
                        </span>
                      )}
                    </div>
                    {!email.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Detail and Reply Panel */}
      <div className={`${
        isMobile 
          ? showEmailList ? 'hidden' : 'w-full' 
          : 'flex-1'
      } flex flex-col`}>
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {isMobile && (
                    <button
                      onClick={handleBackToList}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 truncate">{selectedEmail.subject}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{selectedEmail.fromName} {selectedEmail.from}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{selectedEmail.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                    <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedEmail.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Archive className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Labels */}
              {selectedEmail.labels.length > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex space-x-1 overflow-x-auto">
                    {selectedEmail.labels.map((label) => (
                      <span key={label} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => generateAIResponse(selectedEmail)}
                  disabled={isGeneratingAI}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isGeneratingAI ? 'Generating...' : 'Generate AI Reply'}</span>
                </button>
                <div className="flex space-x-2">
                  <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex-1 sm:flex-none">
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex-1 sm:flex-none">
                    <Forward className="h-4 w-4" />
                    <span>Forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Email Body */}
              <div className={`${showAIPanel && !isMobile ? 'lg:w-1/2' : 'w-full'} bg-white p-4 sm:p-6 overflow-y-auto transition-all duration-300`}>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm sm:text-base">
                    {selectedEmail.body}
                  </div>
                </div>
              </div>

              {/* AI Reply Panel */}
              {showAIPanel && (
                <div className={`${isMobile ? 'w-full border-t' : 'lg:w-1/2 border-l'} border-gray-200 bg-gray-50 flex flex-col`}>
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
                        <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                        AI-Generated Reply
                      </h3>
                      <button
                        onClick={() => setShowAIPanel(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isMobile ? <X className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>
                    </div>
                    {aiResponse && (
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            aiResponse.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                            aiResponse.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(aiResponse.confidence * 100)}% confidence
                          </span>
                          <span className="text-xs text-gray-500">{aiResponse.tone}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {isGeneratingAI ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-gray-600 text-sm">Analyzing email and generating response...</p>
                        </div>
                      </div>
                    ) : aiResponse ? (
                      <>
                        {/* AI Reasoning */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">AI Analysis</h4>
                          <p className="text-xs text-gray-600">{aiResponse.reasoning}</p>
                        </div>

                        {/* Reply Editor */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Reply Draft</span>
                            <button
                              onClick={() => setReplyText(aiResponse.suggestion)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Reset to AI suggestion
                            </button>
                          </div>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full h-48 sm:h-64 p-3 border-0 resize-none focus:ring-0 focus:outline-none text-sm"
                            placeholder="Edit your reply here..."
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                          <button
                            onClick={handleSendReply}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                          >
                            <Send className="h-4 w-4" />
                            <span>Send Reply</span>
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center p-4">
              <Mail className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select an email</h3>
              <p className="text-sm sm:text-base text-gray-600">Choose an email from the inbox to view details and generate AI responses</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};