import React, { createContext, useContext, useState } from 'react';
import { Category, CompanyDocument, Email, MailboxConfig, LogEntry } from '../types';

interface AppContextType {
  categories: Category[];
  documents: CompanyDocument[];
  emails: Email[];
  mailboxConfig: MailboxConfig | null;
  logs: LogEntry[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addDocument: (document: Omit<CompanyDocument, 'id'>) => void;
  updateMailboxConfig: (config: MailboxConfig) => void;
  addEmail: (email: Omit<Email, 'id'>) => void;
  updateEmail: (id: string, email: Partial<Email>) => void;
  addLog: (log: Omit<LogEntry, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Marketing',
      description: 'Marketing and promotional inquiries',
      tone: 'friendly',
      template: 'Thank you for your interest in our services. We\'ll get back to you soon!',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Customer Care',
      description: 'Customer support and service requests',
      tone: 'professional',
      template: 'Thank you for contacting our support team. We\'re here to help!',
      color: 'bg-green-500'
    }
  ]);

  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: 'customer@example.com',
      to: 'support@company.com',
      subject: 'Question about your services',
      body: 'Hi, I\'m interested in learning more about your pricing and packages.',
      receivedAt: new Date(Date.now() - 3600000),
      category: 'Marketing',
      replySuggestion: 'Thank you for your interest! I\'d be happy to share our pricing information with you.',
      confidence: 0.85,
      status: 'pending'
    }
  ]);

  const [mailboxConfig, setMailboxConfig] = useState<MailboxConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1800000),
      type: 'pending',
      email: 'customer@example.com',
      subject: 'Question about your services',
      confidence: 0.85,
      action: 'AI suggestion generated'
    }
  ]);

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: Date.now().toString() };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const addDocument = (document: Omit<CompanyDocument, 'id'>) => {
    const newDocument = { ...document, id: Date.now().toString() };
    setDocuments(prev => [...prev, newDocument]);
  };

  const updateMailboxConfig = (config: MailboxConfig) => {
    setMailboxConfig(config);
  };

  const addEmail = (email: Omit<Email, 'id'>) => {
    const newEmail = { ...email, id: Date.now().toString() };
    setEmails(prev => [...prev, newEmail]);
  };

  const updateEmail = (id: string, updates: Partial<Email>) => {
    setEmails(prev => prev.map(email => email.id === id ? { ...email, ...updates } : email));
  };

  const addLog = (log: Omit<LogEntry, 'id'>) => {
    const newLog = { ...log, id: Date.now().toString() };
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      categories,
      documents,
      emails,
      mailboxConfig,
      logs,
      addCategory,
      updateCategory,
      deleteCategory,
      addDocument,
      updateMailboxConfig,
      addEmail,
      updateEmail,
      addLog,
    }}>
      {children}
    </AppContext.Provider>
  );
};