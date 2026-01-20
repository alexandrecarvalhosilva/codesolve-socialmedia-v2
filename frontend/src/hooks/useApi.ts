/**
 * useApi - Hook customizado para gerenciamento de estado de requisições
 * 
 * Fornece uma interface simples para:
 * - Gerenciar estados de loading, error e data
 * - Executar requisições com tratamento automático de erros
 * - Refetch de dados
 * - Cache simples em memória
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { api, ApiError, ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseApiOptions {
  /** Executar automaticamente ao montar o componente */
  immediate?: boolean;
  /** Dependências para re-executar a query */
  deps?: unknown[];
  /** Callback de sucesso */
  onSuccess?: (data: unknown) => void;
  /** Callback de erro */
  onError?: (error: ApiError) => void;
}

/**
 * Hook para requisições GET (queries)
 */
export function useQuery<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options: UseApiOptions = {}
) {
  const { immediate = true, deps = [], onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const isMounted = useRef(true);

  const execute = useCallback(async (overrideParams?: Record<string, string | number | boolean | undefined>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.get<T>(endpoint, overrideParams || params);
      
      if (isMounted.current) {
        setState({ data: response.data ?? null, isLoading: false, error: null });
        onSuccess?.(response.data);
      }
      
      return response;
    } catch (error) {
      const apiError = error instanceof ApiError 
        ? error 
        : new ApiError('Erro desconhecido', 'UNKNOWN', 500);
      
      if (isMounted.current) {
        setState(prev => ({ ...prev, isLoading: false, error: apiError }));
        onError?.(apiError);
      }
      
      throw apiError;
    }
  }, [endpoint, JSON.stringify(params), onSuccess, onError]);

  const refetch = useCallback(() => execute(), [execute]);

  useEffect(() => {
    isMounted.current = true;
    
    if (immediate) {
      execute();
    }

    return () => {
      isMounted.current = false;
    };
  }, [immediate, ...deps]);

  return {
    ...state,
    execute,
    refetch,
  };
}

/**
 * Hook para requisições de mutação (POST, PUT, PATCH, DELETE)
 */
export function useMutation<TData, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: {
    onSuccess?: (data: TData | undefined, variables: TVariables) => void;
    onError?: (error: ApiError, variables: TVariables) => void;
  } = {}
) {
  const { onSuccess, onError } = options;

  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const mutate = useCallback(async (variables: TVariables) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await mutationFn(variables);
      
      setState({ data: response.data ?? null, isLoading: false, error: null });
      onSuccess?.(response.data, variables);
      
      return response;
    } catch (error) {
      const apiError = error instanceof ApiError 
        ? error 
        : new ApiError('Erro desconhecido', 'UNKNOWN', 500);
      
      setState(prev => ({ ...prev, isLoading: false, error: apiError }));
      onError?.(apiError, variables);
      
      throw apiError;
    }
  }, [mutationFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

/**
 * Hook para paginação
 */
export function usePaginatedQuery<T>(
  endpoint: string,
  initialParams: {
    page?: number;
    limit?: number;
    search?: string;
    [key: string]: string | number | boolean | undefined;
  } = {},
  options: UseApiOptions = {}
) {
  const [page, setPage] = useState(initialParams.page || 1);
  const [limit, setLimit] = useState(initialParams.limit || 10);
  const [search, setSearch] = useState(initialParams.search || '');

  const params = {
    ...initialParams,
    page,
    limit,
    search: search || undefined,
  };

  const query = useQuery<T>(endpoint, params, {
    ...options,
    deps: [page, limit, search, ...(options.deps || [])],
  });

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const changeSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when searching
  }, []);

  return {
    ...query,
    page,
    limit,
    search,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    changeSearch,
  };
}

export default useQuery;
