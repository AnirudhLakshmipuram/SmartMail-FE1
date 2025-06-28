import { User, Category, CompanyDocument, Email, MailboxConfig, LogEntry } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.email-autoresponder.com/v1';

// Comprehensive dummy data that simulates real API responses
const dummyCategories: Category[] = [
  {
    id: 'cat_001',
    name: 'Customer Support',
    description: 'Handle customer support and service requests with empathy and efficiency',
    tone: 'professional',
    template: 'Thank you for contacting our support team. We understand your concern and are here to help you resolve this issue quickly. Our team will review your request and get back to you within 24 hours with a solution.',
    customPrompt: 'Always be empathetic and solution-focused. Acknowledge the customer\'s frustration and provide clear next steps.',
    color: 'bg-blue-500'
  },
  {
    id: 'cat_002',
    name: 'Sales Inquiry',
    description: 'Sales and product inquiries from potential customers',
    tone: 'friendly',
    template: 'Thank you for your interest in our products! I\'d be delighted to provide you with more information about our solutions. Our team specializes in helping businesses like yours achieve their goals.',
    customPrompt: 'Be enthusiastic and helpful. Focus on benefits and value proposition.',
    color: 'bg-green-500'
  },
  {
    id: 'cat_003',
    name: 'Technical Support',
    description: 'Technical issues, troubleshooting, and product assistance',
    tone: 'professional',
    template: 'I understand you\'re experiencing a technical issue. Let me help you troubleshoot this problem step by step. I\'ll guide you through the solution process to get everything working smoothly again.',
    customPrompt: 'Be clear and methodical. Provide step-by-step instructions and ask for confirmation.',
    color: 'bg-purple-500'
  },
  {
    id: 'cat_004',
    name: 'Billing & Payments',
    description: 'Billing inquiries, payment issues, and account management',
    tone: 'professional',
    template: 'Thank you for reaching out regarding your billing inquiry. I\'ll review your account details and ensure we resolve any payment-related concerns promptly and accurately.',
    customPrompt: 'Be precise with financial information. Always verify account details before proceeding.',
    color: 'bg-orange-500'
  },
  {
    id: 'cat_005',
    name: 'Partnership & Business',
    description: 'Business partnerships, collaborations, and enterprise inquiries',
    tone: 'formal',
    template: 'Thank you for your interest in exploring a business partnership with us. We appreciate the opportunity to discuss potential collaboration and look forward to learning more about your proposal.',
    customPrompt: 'Maintain professional tone. Focus on mutual benefits and next steps.',
    color: 'bg-indigo-500'
  },
  {
    id: 'cat_006',
    name: 'General Inquiry',
    description: 'General questions and miscellaneous requests',
    tone: 'friendly',
    template: 'Thank you for reaching out to us. We appreciate your inquiry and will ensure you receive the information you need. Our team is here to assist you with any questions you may have.',
    color: 'bg-gray-500'
  }
];

const dummyDocuments: CompanyDocument[] = [
  {
    id: 'doc_001',
    name: 'Company_Policy_Manual_2024.pdf',
    type: 'pdf',
    size: 2048576, // 2MB
    uploadDate: new Date('2024-01-15T10:30:00Z'),
    content: 'COMPANY POLICY MANUAL 2024\n\nTable of Contents:\n1. Code of Conduct\n2. Customer Service Standards\n3. Data Privacy and Security\n4. Communication Guidelines\n\nOur company is committed to providing exceptional customer service while maintaining the highest standards of professionalism and integrity. All customer interactions should be handled with respect, empathy, and efficiency.\n\nCustomer Service Standards:\n- Respond to all inquiries within 24 hours\n- Maintain a professional and friendly tone\n- Provide accurate and helpful information\n- Follow up to ensure customer satisfaction\n\nData Privacy:\nWe are committed to protecting customer data and maintaining confidentiality in all communications.',
    categories: ['cat_001', 'cat_006']
  },
  {
    id: 'doc_002',
    name: 'Product_Specifications_Guide.docx',
    type: 'doc',
    size: 1536000, // 1.5MB
    uploadDate: new Date('2024-01-20T14:15:00Z'),
    content: 'PRODUCT SPECIFICATIONS GUIDE\n\nOur flagship products include:\n\n1. AI Email Responder Pro\n- Advanced natural language processing\n- Multi-language support\n- Custom template creation\n- Real-time analytics\n- Enterprise-grade security\n\n2. Smart Automation Suite\n- Workflow automation\n- Integration capabilities\n- Custom rule engine\n- Performance monitoring\n\nTechnical Requirements:\n- Minimum 4GB RAM\n- Internet connection required\n- Compatible with major email providers\n- Cloud-based deployment available\n\nPricing:\n- Starter Plan: $29/month\n- Professional Plan: $79/month\n- Enterprise Plan: Custom pricing',
    categories: ['cat_002', 'cat_003']
  },
  {
    id: 'doc_003',
    name: 'Billing_and_Payment_Procedures.txt',
    type: 'txt',
    size: 512000, // 512KB
    uploadDate: new Date('2024-01-25T09:45:00Z'),
    content: 'BILLING AND PAYMENT PROCEDURES\n\nPayment Methods Accepted:\n- Credit Cards (Visa, MasterCard, American Express)\n- PayPal\n- Bank Transfer\n- Corporate Purchase Orders\n\nBilling Cycles:\n- Monthly billing on the same date each month\n- Annual billing with 15% discount\n- Enterprise custom billing terms available\n\nPayment Issues Resolution:\n1. Verify payment method details\n2. Check for expired cards or insufficient funds\n3. Contact payment processor if needed\n4. Provide alternative payment options\n5. Extend grace period if necessary\n\nRefund Policy:\n- 30-day money-back guarantee\n- Pro-rated refunds for annual plans\n- Processing time: 5-7 business days',
    categories: ['cat_004']
  },
  {
    id: 'doc_004',
    name: 'Technical_Troubleshooting_Guide.pdf',
    type: 'pdf',
    size: 3072000, // 3MB
    uploadDate: new Date('2024-02-01T11:20:00Z'),
    content: 'TECHNICAL TROUBLESHOOTING GUIDE\n\nCommon Issues and Solutions:\n\n1. Email Integration Problems\n- Verify IMAP/SMTP settings\n- Check app password configuration\n- Ensure 2-factor authentication is enabled\n- Test connection with provided credentials\n\n2. AI Response Generation Issues\n- Check internet connectivity\n- Verify API key validity\n- Review email content for processing\n- Check confidence threshold settings\n\n3. Performance Optimization\n- Clear browser cache\n- Update to latest version\n- Check system requirements\n- Monitor resource usage\n\n4. Data Synchronization\n- Verify account permissions\n- Check sync settings\n- Review error logs\n- Restart synchronization process\n\nEscalation Procedures:\nIf basic troubleshooting doesn\'t resolve the issue, escalate to Level 2 support with detailed error logs and reproduction steps.',
    categories: ['cat_003']
  }
];

const dummyEmails: Email[] = [
  {
    id: 'email_001',
    from: 'sarah.johnson@techcorp.com',
    to: 'support@company.com',
    subject: 'Urgent: Payment processing error for invoice #INV-2024-001',
    body: 'Hi Support Team,\n\nWe\'re experiencing difficulties processing payment for invoice #INV-2024-001. The payment gateway is returning error code 4001, and our accounting team needs this resolved urgently as it\'s affecting our month-end closing.\n\nCould you please investigate this issue and provide a solution as soon as possible?\n\nBest regards,\nSarah Johnson\nAccounts Payable Manager\nTechCorp Solutions',
    receivedAt: new Date(Date.now() - 1800000), // 30 minutes ago
    category: 'Billing & Payments',
    replySuggestion: 'I understand the urgency of resolving this payment processing issue for invoice #INV-2024-001. Error code 4001 typically indicates a temporary gateway issue. I\'ve escalated this to our payment processing team and will provide you with an alternative payment method within the next hour.',
    confidence: 0.94,
    status: 'pending'
  },
  {
    id: 'email_002',
    from: 'mike.chen@startup.io',
    to: 'partnerships@company.com',
    subject: 'Partnership opportunity - AI integration for customer service',
    body: 'Hello,\n\nI hope this email finds you well. I\'m reaching out from Startup.io regarding a potential partnership opportunity.\n\nWe\'ve been following your company\'s impressive work in AI-powered email automation, and we believe there could be significant synergy between our customer service platform and your AI technology.\n\nWould you be available for a brief call next week to discuss how we might collaborate? I\'d love to explore how our combined solutions could benefit both our customer bases.\n\nLooking forward to hearing from you.\n\nBest regards,\nMike Chen\nBusiness Development Director\nStartup.io',
    receivedAt: new Date(Date.now() - 3600000), // 1 hour ago
    category: 'Partnership & Business',
    replySuggestion: 'Thank you for reaching out about the partnership opportunity. We\'re always interested in exploring collaborations that can benefit our customers. I\'d be happy to schedule a call next week to discuss potential synergies between our AI technology and your customer service platform.',
    confidence: 0.89,
    status: 'sent'
  },
  {
    id: 'email_003',
    from: 'alex.rodriguez@enterprise.com',
    to: 'sales@company.com',
    subject: 'Enterprise plan pricing and implementation timeline',
    body: 'Dear Sales Team,\n\nWe\'re a Fortune 500 company evaluating AI email automation solutions for our customer service department. We handle approximately 10,000 customer emails daily across multiple departments.\n\nCould you please provide:\n1. Enterprise plan pricing for 500+ users\n2. Implementation timeline and process\n3. Training and onboarding support\n4. Integration capabilities with Salesforce and ServiceNow\n5. Compliance certifications (SOC 2, GDPR, etc.)\n\nWe\'re looking to make a decision within the next 30 days, so prompt response would be appreciated.\n\nBest regards,\nAlex Rodriguez\nIT Director\nEnterprise Corp',
    receivedAt: new Date(Date.now() - 5400000), // 1.5 hours ago
    category: 'Sales Inquiry',
    replySuggestion: 'Thank you for considering our AI email automation solution for Enterprise Corp. I\'d be delighted to provide you with comprehensive information about our enterprise offerings. Given your scale and requirements, I\'ll prepare a detailed proposal including custom pricing, implementation timeline, and integration specifications.',
    confidence: 0.92,
    status: 'pending'
  },
  {
    id: 'email_004',
    from: 'lisa.wong@smallbiz.com',
    to: 'support@company.com',
    subject: 'Unable to connect Gmail account - authentication error',
    body: 'Hi,\n\nI\'m trying to set up the Gmail integration but keep getting an authentication error. I\'ve followed the setup guide and created an app password, but it\'s still not working.\n\nThe error message says "Invalid credentials" even though I\'m sure I\'m using the correct email and app password.\n\nCan someone help me troubleshoot this issue?\n\nThanks,\nLisa Wong\nSmall Business Owner',
    receivedAt: new Date(Date.now() - 7200000), // 2 hours ago
    category: 'Technical Support',
    replySuggestion: 'I\'ll help you resolve this Gmail integration issue. The "Invalid credentials" error is usually caused by a few common issues. Let me guide you through the troubleshooting steps: First, please verify that 2-Step Verification is enabled on your Google account, as this is required for app passwords.',
    confidence: 0.87,
    status: 'sent'
  },
  {
    id: 'email_005',
    from: 'david.kim@consulting.com',
    to: 'info@company.com',
    subject: 'Demo request for AI email automation platform',
    body: 'Hello,\n\nI represent a consulting firm that works with mid-size businesses to improve their customer service operations. We\'re interested in learning more about your AI email automation platform.\n\nCould we schedule a demo to see the platform in action? We\'re particularly interested in:\n- Response accuracy and customization\n- Integration with existing email systems\n- Analytics and reporting capabilities\n- Pricing for multiple client deployments\n\nWe have several clients who could benefit from this solution.\n\nBest regards,\nDavid Kim\nSenior Consultant\nBusiness Solutions Consulting',
    receivedAt: new Date(Date.now() - 10800000), // 3 hours ago
    category: 'Sales Inquiry',
    replySuggestion: 'Thank you for your interest in our AI email automation platform. I\'d be happy to arrange a comprehensive demo that showcases our platform\'s capabilities, especially focusing on the features you mentioned. Given your consulting background, I can also discuss our partner program for multiple client deployments.',
    confidence: 0.91,
    status: 'pending'
  }
];

const dummyLogs: LogEntry[] = [
  {
    id: 'log_001',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    type: 'sent',
    email: 'mike.chen@startup.io',
    subject: 'Partnership opportunity - AI integration for customer service',
    confidence: 0.89,
    action: 'AI response sent automatically - Partnership inquiry acknowledged'
  },
  {
    id: 'log_002',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    type: 'pending',
    email: 'sarah.johnson@techcorp.com',
    subject: 'Urgent: Payment processing error for invoice #INV-2024-001',
    confidence: 0.94,
    action: 'AI suggestion generated - Awaiting manual review due to billing sensitivity'
  },
  {
    id: 'log_003',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    type: 'sent',
    email: 'lisa.wong@smallbiz.com',
    subject: 'Unable to connect Gmail account - authentication error',
    confidence: 0.87,
    action: 'AI response sent automatically - Technical troubleshooting provided'
  },
  {
    id: 'log_004',
    timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
    type: 'approved',
    email: 'alex.rodriguez@enterprise.com',
    subject: 'Enterprise plan pricing and implementation timeline',
    confidence: 0.92,
    action: 'AI suggestion approved and sent - Enterprise sales inquiry handled'
  },
  {
    id: 'log_005',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    type: 'rejected',
    email: 'competitor@rival.com',
    subject: 'Request for proprietary information',
    confidence: 0.45,
    action: 'AI suggestion rejected - Low confidence, potential competitor inquiry'
  },
  {
    id: 'log_006',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    type: 'pending',
    email: 'david.kim@consulting.com',
    subject: 'Demo request for AI email automation platform',
    confidence: 0.91,
    action: 'AI suggestion generated - Demo request identified, awaiting sales team review'
  }
];

const dummyMailboxConfig: MailboxConfig = {
  email: 'support@company.com',
  appPassword: '••••••••••••••••', // Masked for security
  autoReplyEmails: ['support@company.com', 'sales@company.com', 'info@company.com'],
  confidenceThreshold: 0.85,
  enabled: true
};

class ApiService {
  private token: string | null = null;
  private simulateNetworkDelay = true;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  private async simulateApiCall<T>(data: T, delay: number = 800): Promise<{ success: boolean; data: T }> {
    if (this.simulateNetworkDelay) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Simulate occasional network errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network timeout');
    }
    
    return { success: true, data };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      // For demo purposes, we'll use dummy data instead of real API calls
      return await this.getDummyResponse<T>(endpoint, options.method || 'GET', options.body);
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error - using dummy data' };
    }
  }

  private async getDummyResponse<T>(endpoint: string, method: string, body?: any): Promise<{ success: boolean; data?: T; error?: any }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    if (endpoint === '/categories') {
      return this.simulateApiCall(dummyCategories as T);
    } 
    
    if (endpoint === '/documents') {
      return this.simulateApiCall({ documents: dummyDocuments, pagination: { current_page: 1, total_pages: 1, total_items: dummyDocuments.length } } as T);
    } 
    
    if (endpoint.startsWith('/emails')) {
      return this.simulateApiCall({ 
        emails: dummyEmails, 
        pagination: { 
          current_page: 1, 
          total_pages: 1, 
          total_items: dummyEmails.length,
          items_per_page: 20
        } 
      } as T);
    } 
    
    if (endpoint === '/logs') {
      return this.simulateApiCall({ 
        logs: dummyLogs, 
        pagination: { 
          current_page: 1, 
          total_pages: 1, 
          total_items: dummyLogs.length,
          items_per_page: 20
        } 
      } as T);
    } 
    
    if (endpoint === '/mailbox/configuration') {
      return this.simulateApiCall(dummyMailboxConfig as T);
    }
    
    if (endpoint === '/analytics/dashboard') {
      const dashboardData = {
        summary: {
          total_emails: dummyEmails.length,
          ai_responses_generated: dummyEmails.length,
          auto_sent: dummyEmails.filter(e => e.status === 'sent').length,
          manually_approved: dummyLogs.filter(l => l.type === 'approved').length,
          success_rate: 0.87,
          average_confidence: 0.89,
          average_response_time_ms: 1250
        },
        trends: {
          daily_volumes: [
            { date: '2024-01-15', emails_received: 45, responses_sent: 38, success_rate: 0.84 },
            { date: '2024-01-16', emails_received: 52, responses_sent: 47, success_rate: 0.90 },
            { date: '2024-01-17', emails_received: 38, responses_sent: 35, success_rate: 0.92 }
          ]
        },
        category_breakdown: dummyCategories.map(cat => ({
          category: cat.name,
          count: Math.floor(Math.random() * 50) + 10,
          success_rate: 0.85 + Math.random() * 0.1,
          average_confidence: 0.80 + Math.random() * 0.15
        })),
        confidence_distribution: {
          high: Math.floor(dummyEmails.length * 0.6),
          medium: Math.floor(dummyEmails.length * 0.3),
          low: Math.floor(dummyEmails.length * 0.1)
        }
      };
      return this.simulateApiCall(dashboardData as T);
    }
    
    // Handle POST/PUT/DELETE operations
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      if (endpoint === '/categories' && method === 'POST') {
        const categoryData = JSON.parse(body as string);
        const newCategory: Category = {
          ...categoryData,
          id: `cat_${Date.now()}`
        };
        return this.simulateApiCall(newCategory as T);
      }
      
      if (endpoint.includes('/categories/') && method === 'PUT') {
        const categoryData = JSON.parse(body as string);
        const id = endpoint.split('/').pop();
        const existingCategory = dummyCategories.find(c => c.id === id);
        if (existingCategory) {
          const updatedCategory = { ...existingCategory, ...categoryData };
          return this.simulateApiCall(updatedCategory as T);
        }
      }
      
      if (endpoint.includes('/categories/') && method === 'DELETE') {
        return this.simulateApiCall({ message: 'Category deleted successfully' } as T);
      }
      
      if (endpoint === '/documents/upload') {
        const mockDocument: CompanyDocument = {
          id: `doc_${Date.now()}`,
          name: 'uploaded_document.pdf',
          type: 'pdf',
          size: 1024000,
          uploadDate: new Date(),
          content: 'This is dummy content for the uploaded document. It contains important company information that will help the AI provide better responses.',
          categories: ['cat_001']
        };
        return this.simulateApiCall(mockDocument as T);
      }
      
      if (endpoint.includes('/documents/') && method === 'DELETE') {
        return this.simulateApiCall({ message: 'Document deleted successfully' } as T);
      }
      
      if (endpoint === '/mailbox/configuration' && method === 'PUT') {
        const configData = JSON.parse(body as string);
        return this.simulateApiCall(configData as T);
      }
      
      if (endpoint === '/mailbox/test-connection') {
        return this.simulateApiCall({
          connection_status: 'success',
          message: 'Successfully connected to Gmail',
          inbox_count: 156,
          last_email_date: new Date().toISOString()
        } as T);
      }
      
      if (endpoint === '/ai/generate-response') {
        const mockAIResponse = {
          response_id: `resp_${Date.now()}`,
          suggestion: 'Thank you for your inquiry. I understand your concern and I\'m here to help you resolve this issue promptly. Based on the information you\'ve provided, I can see that this requires immediate attention. Let me connect you with the appropriate specialist who can assist you further.',
          confidence: 0.89,
          category: 'Customer Support',
          tone: 'professional',
          reasoning: 'High confidence response generated based on customer support context and professional tone requirements.',
          alternative_suggestions: [
            {
              suggestion: 'Hi there! Thanks for reaching out. I\'d be happy to help you with this issue. Let me look into this for you right away.',
              tone: 'friendly',
              confidence: 0.82
            }
          ],
          used_documents: ['doc_001', 'doc_004'],
          processing_time_ms: 1250
        };
        return this.simulateApiCall(mockAIResponse as T);
      }
      
      if (endpoint.includes('/emails/') && endpoint.includes('/reply')) {
        const mockSentEmail = {
          sent_email_id: `sent_${Date.now()}`,
          message_id: `msg_${Date.now()}`,
          sent_at: new Date().toISOString(),
          status: 'sent',
          recipients: ['customer@example.com'],
          delivery_status: 'delivered'
        };
        return this.simulateApiCall(mockSentEmail as T);
      }
      
      // Generic success response for other operations
      return this.simulateApiCall({ success: true, message: 'Operation completed successfully' } as T);
    }
    
    return { success: false, error: 'Endpoint not found' };
  }

  // Authentication
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    if (password.length >= 6) {
      const user: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        domain: email.split('@')[1]
      };
      
      const mockToken = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 86400000 }));
      this.token = mockToken;
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockToken);
      
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid credentials' };
  }

  async register(email: string, password: string, name: string, domain?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay
    
    if (password.length >= 6) {
      const user: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        domain: domain || email.split('@')[1]
      };
      
      const mockToken = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 86400000 }));
      this.token = mockToken;
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockToken);
      
      return { success: true, user };
    }
    
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Categories
  async getCategories(): Promise<{ success: boolean; data?: Category[]; error?: string }> {
    const response = await this.request<Category[]>('/categories');
    return response;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<{ success: boolean; data?: Category; error?: string }> {
    const response = await this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return response;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
    const response = await this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
    return response;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Documents
  async getDocuments(): Promise<{ success: boolean; data?: CompanyDocument[]; error?: string }> {
    const response = await this.request<{ documents: CompanyDocument[] }>('/documents');
    return { ...response, data: response.data?.documents };
  }

  async uploadDocument(file: File, categories: string[]): Promise<{ success: boolean; data?: CompanyDocument; error?: string }> {
    // Simulate file upload with progress
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockDocument: CompanyDocument = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'doc' : 'txt',
      size: file.size,
      uploadDate: new Date(),
      content: `This is the extracted content from ${file.name}. The document contains important company information including policies, procedures, and guidelines that will help the AI system provide more accurate and contextual responses to customer inquiries.`,
      categories
    };
    
    return { success: true, data: mockDocument };
  }

  async deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Emails
  async getEmails(params?: { page?: number; limit?: number; filter?: string; search?: string }): Promise<{ success: boolean; data?: { emails: Email[]; pagination: any }; error?: string }> {
    const response = await this.request<{ emails: Email[]; pagination: any }>('/emails/inbox');
    return response;
  }

  async getEmailDetails(id: string): Promise<{ success: boolean; data?: Email; error?: string }> {
    const email = dummyEmails.find(e => e.id === id);
    if (email) {
      return this.simulateApiCall(email);
    }
    return { success: false, error: 'Email not found' };
  }

  async generateAIResponse(emailId: string, preferences?: any): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.request('/ai/generate-response', {
      method: 'POST',
      body: JSON.stringify({
        email_id: emailId,
        context: {
          sender_history: true,
          company_documents: true,
          previous_conversations: true
        },
        preferences: preferences || {
          tone: 'professional',
          length: 'medium',
          include_signature: true
        }
      }),
    });
    return response;
  }

  async sendReply(emailId: string, content: string, htmlContent?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.request(`/emails/${emailId}/reply`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        html_content: htmlContent,
        include_signature: true
      }),
    });
    return response;
  }

  // Mailbox Configuration
  async getMailboxConfig(): Promise<{ success: boolean; data?: MailboxConfig; error?: string }> {
    const response = await this.request<MailboxConfig>('/mailbox/configuration');
    return response;
  }

  async updateMailboxConfig(config: MailboxConfig): Promise<{ success: boolean; data?: MailboxConfig; error?: string }> {
    const response = await this.request<MailboxConfig>('/mailbox/configuration', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return response;
  }

  async testMailboxConnection(email: string, appPassword: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.request('/mailbox/test-connection', {
      method: 'POST',
      body: JSON.stringify({ email, app_password: appPassword }),
    });
    return response;
  }

  // Analytics and Logs
  async getLogs(params?: { page?: number; limit?: number; type?: string; date_from?: string; date_to?: string }): Promise<{ success: boolean; data?: { logs: LogEntry[]; pagination: any }; error?: string }> {
    const response = await this.request<{ logs: LogEntry[]; pagination: any }>('/logs');
    return response;
  }

  async getDashboardAnalytics(period?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.request('/analytics/dashboard');
    return response;
  }
}

export const apiService = new ApiService();