import { useState } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async (
    apiCall: () => Promise<{ success: boolean; data?: T; error?: string }>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } else {
        setState({ data: null, loading: false, error: response.error || 'Unknown error' });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setState({ data: null, loading: false, error: errorMessage });
      return null;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return { ...state, execute, reset };
}