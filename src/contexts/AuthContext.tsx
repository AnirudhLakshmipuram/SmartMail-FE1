import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, domain?: string) => Promise<boolean>;
  logout: () => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on app load
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        
        if (savedUser && token) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('✅ Restored user session:', parsedUser.email);
        }
      } catch (err) {
        console.error('❌ Error restoring session:', err);
        // Clear invalid session data
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await apiService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('✅ Login successful for:', response.user.email);
        return true;
      } else {
        const errorMessage = response.error || 'Login failed';
        setError(errorMessage);
        console.error('❌ Login failed:', errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = 'Network error - please check your connection';
      setError(errorMessage);
      console.error('❌ Login network error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, domain?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📝 Attempting registration for:', email);
      const response = await apiService.register(email, password, name, domain);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('✅ Registration successful for:', response.user.email);
        return true;
      } else {
        const errorMessage = response.error || 'Registration failed';
        setError(errorMessage);
        console.error('❌ Registration failed:', errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = 'Network error - please check your connection';
      setError(errorMessage);
      console.error('❌ Registration network error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🚪 Logging out user:', user?.email);
      await apiService.logout();
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all user data
      setUser(null);
      setError(null);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsLoading(false);
      console.log('✅ User logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};