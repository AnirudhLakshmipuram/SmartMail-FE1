export interface User {
  id: string;
  email: string;
  name: string;
  domain?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  customPrompt?: string;
  tone: 'professional' | 'friendly' | 'formal' | 'casual';
  template: string;
  color: string;
}

export interface CompanyDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt';
  size: number;
  uploadDate: Date;
  content: string;
  categories: string[];
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: Date;
  category?: string;
  replySuggestion?: string;
  confidence: number;
  status: 'pending' | 'sent' | 'failed' | 'draft';
}

export interface MailboxConfig {
  email: string;
  appPassword: string;
  autoReplyEmails: string[];
  confidenceThreshold: number;
  enabled: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'sent' | 'failed' | 'pending' | 'approved' | 'rejected';
  email: string;
  subject: string;
  confidence: number;
  action: string;
}