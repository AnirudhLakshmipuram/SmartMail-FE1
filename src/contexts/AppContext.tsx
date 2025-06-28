import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, CompanyDocument, Email, MailboxConfig, LogEntry } from '../types';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';

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
  addCategory: (category: Omit<Category, 'id'>) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addDocument: (file: File, categories: string[]) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  updateMailboxConfig: (config: MailboxConfig) => Promise<boolean>;
  refreshData: () => void;
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

  // API hooks for data fetching
  const categoriesApi = useApi(() => apiService.getCategories());
  const documentsApi = useApi(() => apiService.getDocuments());
  const emailsApi = useApi(() => apiService.getEmails());
  const mailboxConfigApi = useApi(() => apiService.getMailboxConfig());
  const logsApi = useApi(() => apiService.getLogs());

  // Update state when API data changes
  useEffect(() => {
    if (categoriesApi.data) {
      setCategories(categoriesApi.data);
    }
  }, [categoriesApi.data]);

  useEffect(() => {
    if (documentsApi.data) {
      setDocuments(documentsApi.data);
    }
  }, [documentsApi.data]);

  useEffect(() => {
    if (emailsApi.data) {
      setEmails(emailsApi.data.emails);
    }
  }, [emailsApi.data]);

  useEffect(() => {
    if (mailboxConfigApi.data) {
      setMailboxConfig(mailboxConfigApi.data);
    }
  }, [mailboxConfigApi.data]);

  useEffect(() => {
    if (logsApi.data) {
      setLogs(logsApi.data.logs);
    }
  }, [logsApi.data]);

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

  const refreshData = () => {
    categoriesApi.refetch();
    documentsApi.refetch();
    emailsApi.refetch();
    mailboxConfigApi.refetch();
    logsApi.refetch();
  };

  return (
    <AppContext.Provider value={{
      categories,
      documents,
      emails,
      mailboxConfig,
      logs,
      loading: {
        categories: categoriesApi.loading,
        documents: documentsApi.loading,
        emails: emailsApi.loading,
        mailboxConfig: mailboxConfigApi.loading,
        logs: logsApi.loading,
      },
      error: {
        categories: categoriesApi.error,
        documents: documentsApi.error,
        emails: emailsApi.error,
        mailboxConfig: mailboxConfigApi.error,
        logs: logsApi.error,
      },
      addCategory,
      updateCategory,
      deleteCategory,
      addDocument,
      deleteDocument,
      updateMailboxConfig,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};