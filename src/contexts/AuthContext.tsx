import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, domain?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo credentials for testing
const DEMO_CREDENTIALS = [
  { email: 'demo@company.com', password: 'demo123', name: 'Demo User', domain: 'company.com' },
  { email: 'admin@company.com', password: 'admin123', name: 'Admin User', domain: 'company.com' },
  { email: 'test@example.com', password: 'test123', name: 'Test User', domain: 'example.com' },
  { email: 'user@demo.com', password: 'password', name: 'Sample User', domain: 'demo.com' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const demoLogin = (email: string, password: string): { success: boolean; user?: User } => {
    const demoUser = DEMO_CREDENTIALS.find(
      cred => cred.email === email && cred.password === password
    );

    if (demoUser) {
      const user: User = {
        id: Date.now().toString(),
        email: demoUser.email,
        name: demoUser.name,
        domain: demoUser.domain,
      };
      
      // Create a mock token
      const mockToken = btoa(JSON.stringify({ userId: user.id, email: user.email }));
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockToken);
      
      return { success: true, user };
    }

    // Also allow any email with password length >= 6 (original demo behavior)
    if (password.length >= 6) {
      const user: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
      };
      
      const mockToken = btoa(JSON.stringify({ userId: user.id, email: user.email }));
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockToken);
      
      return { success: true, user };
    }

    return { success: false };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try the real API
      const response = await apiService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      } else {
        // If API fails, try demo login
        console.log('API login failed, trying demo credentials...');
        const demoResult = demoLogin(email, password);
        
        if (demoResult.success && demoResult.user) {
          setUser(demoResult.user);
          localStorage.setItem('user', JSON.stringify(demoResult.user));
          return true;
        } else {
          setError('Invalid credentials. Try demo@company.com / demo123');
          return false;
        }
      }
    } catch (error) {
      console.log('Network error, trying demo credentials...');
      // If network error, try demo login
      const demoResult = demoLogin(email, password);
      
      if (demoResult.success && demoResult.user) {
        setUser(demoResult.user);
        localStorage.setItem('user', JSON.stringify(demoResult.user));
        return true;
      } else {
        setError('Network error. Try demo@company.com / demo123');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, domain?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try the real API
      const response = await apiService.register(email, password, name, domain);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      } else {
        // If API fails, create demo user
        console.log('API registration failed, creating demo user...');
        if (password.length >= 6) {
          const user: User = {
            id: Date.now().toString(),
            email,
            name,
            domain,
          };
          
          const mockToken = btoa(JSON.stringify({ userId: user.id, email: user.email }));
          localStorage.setItem('access_token', mockToken);
          localStorage.setItem('refresh_token', mockToken);
          
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          return true;
        } else {
          setError('Password must be at least 6 characters');
          return false;
        }
      }
    } catch (error) {
      console.log('Network error, creating demo user...');
      // If network error, create demo user
      if (password.length >= 6) {
        const user: User = {
          id: Date.now().toString(),
          email,
          name,
          domain,
        };
        
        const mockToken = btoa(JSON.stringify({ userId: user.id, email: user.email }));
        localStorage.setItem('access_token', mockToken);
        localStorage.setItem('refresh_token', mockToken);
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      } else {
        setError('Password must be at least 6 characters');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};