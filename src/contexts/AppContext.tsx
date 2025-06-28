import React, { createContext, useContext, useState } from 'react';
import { Category, CompanyDocument, Email, MailboxConfig, LogEntry } from '../types';
import { apiService } from '../services/api';

interface AppContextType {
  categories: Category[];
  documents: CompanyDocument[];
  emails: Email[];
  mailboxConfig: MailboxConfig | null;
  logs: LogEntry[];
  loading: {
    categories: boolean;
    documents: boolean;
    emails: boolean;
    mailboxConfig: boolean;
    logs: boolean;
  };
  error: {
    categories: string | null;
    documents: string | null;
    emails: string | null;
    mailboxConfig: string | null;
    logs: string | null;
  };
  // Page-specific load functions
  loadPageData: (page: 'dashboard' | 'configuration' | 'upload' | 'mailbox' | 'mailbox-config' | 'logs') => Promise<void>;
  // Manual trigger functions
  loadCategories: () => Promise<void>;
  loadDocuments: () => Promise<void>;
  loadEmails: () => Promise<void>;
  loadMailboxConfig: () => Promise<void>;
  loadLogs: () => Promise<void>;
  // CRUD operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addDocument: (file: File, categories: string[]) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  updateMailboxConfig: (config: MailboxConfig) => Promise<boolean>;
  // Utility functions
  refreshData: () => void;
  clearData: () => void;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [mailboxConfig, setMailboxConfig] = useState<MailboxConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [loading, setLoading] = useState({
    categories: false,
    documents: false,
    emails: false,
    mailboxConfig: false,
    logs: false,
  });

  const [error, setError] = useState({
    categories: null as string | null,
    documents: null as string | null,
    emails: null as string | null,
    mailboxConfig: null as string | null,
    logs: null as string | null,
  });

  // Page-specific data loading
  const loadPageData = async (page: 'dashboard' | 'configuration' | 'upload' | 'mailbox' | 'mailbox-config' | 'logs') => {
    console.log(`🔄 Loading data for page: ${page}`);
    
    switch (page) {
      case 'dashboard':
        // Dashboard needs overview data from all APIs
        await Promise.all([
          loadCategories(),
          loadDocuments(),
          loadEmails(),
          loadLogs()
        ]);
        break;
        
      case 'configuration':
        // Configuration page only needs categories
        await loadCategories();
        break;
        
      case 'upload':
        // Upload page needs categories (for assignment) and documents (to show existing)
        await Promise.all([
          loadCategories(),
          loadDocuments()
        ]);
        break;
        
      case 'mailbox':
        // Mailbox page needs mailbox config and emails
        await Promise.all([
          loadMailboxConfig(),
          loadEmails()
        ]);
        break;
        
      case 'mailbox-config':
        // Mailbox config page needs categories and mailbox config
        await Promise.all([
          loadCategories(),
          loadMailboxConfig()
        ]);
        break;
        
      case 'logs':
        // Logs page only needs logs
        await loadLogs();
        break;
        
      default:
        console.warn(`Unknown page: ${page}`);
    }
  };

  // Individual data loading functions
  const loadCategories = async () => {
    if (loading.categories) return; // Prevent duplicate calls
    
    setLoading(prev => ({ ...prev, categories: true }));
    setError(prev => ({ ...prev, categories: null }));
    
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        console.log(`✅ Loaded ${response.data.length} categories`);
      } else {
        setError(prev => ({ ...prev, categories: response.error || 'Failed to load categories' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, categories: 'Network error while loading categories' }));
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const loadDocuments = async () => {
    if (loading.documents) return; // Prevent duplicate calls
    
    setLoading(prev => ({ ...prev, documents: true }));
    setError(prev => ({ ...prev, documents: null }));
    
    try {
      const response = await apiService.getDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
        console.log(`✅ Loaded ${response.data.length} documents`);
      } else {
        setError(prev => ({ ...prev, documents: response.error || 'Failed to load documents' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, documents: 'Network error while loading documents' }));
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  };

  const loadEmails = async () => {
    if (loading.emails) return; // Prevent duplicate calls
    
    setLoading(prev => ({ ...prev, emails: true }));
    setError(prev => ({ ...prev, emails: null }));
    
    try {
      const response = await apiService.getEmails();
      if (response.success && response.data) {
        setEmails(response.data.emails);
        console.log(`✅ Loaded ${response.data.emails.length} emails`);
      } else {
        setError(prev => ({ ...prev, emails: response.error || 'Failed to load emails' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, emails: 'Network error while loading emails' }));
    } finally {
      setLoading(prev => ({ ...prev, emails: false }));
    }
  };

  const loadMailboxConfig = async () => {
    if (loading.mailboxConfig) return; // Prevent duplicate calls
    
    setLoading(prev => ({ ...prev, mailboxConfig: true }));
    setError(prev => ({ ...prev, mailboxConfig: null }));
    
    try {
      const response = await apiService.getMailboxConfig();
      if (response.success && response.data) {
        setMailboxConfig(response.data);
        console.log(`✅ Loaded mailbox configuration`);
      } else {
        setError(prev => ({ ...prev, mailboxConfig: response.error || 'Failed to load mailbox config' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, mailboxConfig: 'Network error while loading mailbox config' }));
    } finally {
      setLoading(prev => ({ ...prev, mailboxConfig: false }));
    }
  };

  const loadLogs = async () => {
    if (loading.logs) return; // Prevent duplicate calls
    
    setLoading(prev => ({ ...prev, logs: true }));
    setError(prev => ({ ...prev, logs: null }));
    
    try {
      const response = await apiService.getLogs();
      if (response.success && response.data) {
        setLogs(response.data.logs);
        console.log(`✅ Loaded ${response.data.logs.length} logs`);
      } else {
        setError(prev => ({ ...prev, logs: response.error || 'Failed to load logs' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, logs: 'Network error while loading logs' }));
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  };

  // CRUD operations
  const addCategory = async (category: Omit<Category, 'id'>): Promise<boolean> => {
    const response = await apiService.createCategory(category);
    if (response.success && response.data) {
      setCategories(prev => [...prev, response.data!]);
      return true;
    }
    return false;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<boolean> => {
    const response = await apiService.updateCategory(id, updates);
    if (response.success && response.data) {
      setCategories(prev => prev.map(cat => cat.id === id ? response.data! : cat));
      return true;
    }
    return false;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const response = await apiService.deleteCategory(id);
    if (response.success) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return true;
    }
    return false;
  };

  const addDocument = async (file: File, categories: string[]): Promise<boolean> => {
    const response = await apiService.uploadDocument(file, categories);
    if (response.success && response.data) {
      setDocuments(prev => [...prev, response.data!]);
      return true;
    }
    return false;
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    const response = await apiService.deleteDocument(id);
    if (response.success) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return true;
    }
    return false;
  };

  const updateMailboxConfig = async (config: MailboxConfig): Promise<boolean> => {
    const response = await apiService.updateMailboxConfig(config);
    if (response.success && response.data) {
      setMailboxConfig(response.data);
      return true;
    }
    return false;
  };

  // Utility functions
  const refreshData = () => {
    loadCategories();
    loadDocuments();
    loadEmails();
    loadMailboxConfig();
    loadLogs();
  };

  const clearData = () => {
    setCategories([]);
    setDocuments([]);
    setEmails([]);
    setMailboxConfig(null);
    setLogs([]);
    setError({
      categories: null,
      documents: null,
      emails: null,
      mailboxConfig: null,
      logs: null,
    });
  };

  return (
    <AppContext.Provider value={{
      categories,
      documents,
      emails,
      mailboxConfig,
      logs,
      loading,
      error,
      loadPageData,
      loadCategories,
      loadDocuments,
      loadEmails,
      loadMailboxConfig,
      loadLogs,
      addCategory,
      updateCategory,
      deleteCategory,
      addDocument,
      deleteDocument,
      updateMailboxConfig,
      refreshData,
      clearData,
    }}>
      {children}
    </AppContext.Provider>
  );
};