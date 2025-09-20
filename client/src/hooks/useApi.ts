/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef, useEffect } from 'react';
import type { ProcessedResponse } from '../lib/responseHandler';

export interface UseApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseApiReturn<T = any> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<ProcessedResponse<T>>;
  reset: () => void;
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    successMessage?: string;
    showSuccessToast?: boolean;
  } = {}
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  // Use refs to store options to prevent infinite loops
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(async (...args: any[]): Promise<ProcessedResponse<T>> => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

        try {
          const response = await apiFunction(...args);
          
          // Handle axios response
          if (response.data && response.data.success) {
            const responseData = response.data.data || response.data;
            setState(prev => ({
              ...prev,
              data: responseData || null,
              loading: false,
              error: null,
              success: true
            }));

            if (optionsRef.current.onSuccess && responseData) {
              optionsRef.current.onSuccess(responseData);
            }

            return {
              success: true,
              data: responseData,
              message: response.data.message
            };
          } else {
        const errorMessage = response.data?.message || 'An error occurred';
        setState(prev => ({
          ...prev,
          data: null,
          loading: false,
          error: errorMessage,
          success: false
        }));

        if (optionsRef.current.onError) {
          optionsRef.current.onError(errorMessage);
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            status: response.status || 500
          }
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      }));

      if (optionsRef.current.onError) {
        optionsRef.current.onError(errorMessage);
      }

      return {
        success: false,
        error: {
          message: errorMessage,
          status: error.response?.status || 500
        }
      };
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Handle immediate execution
  useEffect(() => {
    if (optionsRef.current.immediate) {
      execute();
    }
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    setData,
    setLoading,
    setError
  };
}

// Specialized hooks for common operations
export function useApiList<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T[]) => void;
    onError?: (error: string) => void;
  } = {}
) {
  return useApi<T[]>(apiFunction, {
    ...options,
    onSuccess: (data) => {
      if (options.onSuccess && Array.isArray(data)) {
        options.onSuccess(data);
      }
    }
  });
}

export function useApiCreate<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    itemName?: string;
  } = {}
) {
  return useApi<T>(apiFunction, options);
}

export function useApiUpdate<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    itemName?: string;
  } = {}
) {
  return useApi<T>(apiFunction, options);
}

export function useApiDelete<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    itemName?: string;
  } = {}
) {
  return useApi<T>(apiFunction, options);
}