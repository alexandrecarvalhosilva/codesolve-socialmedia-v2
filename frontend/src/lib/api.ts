/**
 * API Client - Cliente HTTP centralizado para comunicação com o backend
 * 
 * Este módulo fornece uma interface unificada para todas as chamadas à API,
 * incluindo:
 * - Configuração automática de headers (JWT, Content-Type)
 * - Interceptors para tratamento de erros
 * - Tipagem forte para respostas
 * - Refresh automático de token (futuro)
 */

// URL base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Chaves de storage
const AUTH_TOKEN_KEY = 'codesolve_auth_token';

/**
 * Tipos de resposta da API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Opções para requisições
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Erros customizados da API
 */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Obtém o token JWT do localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Constrói a URL com query params
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Função principal de requisição
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, params, headers: customHeaders, ...restOptions } = options;

  // Construir headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Adicionar token JWT se disponível
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Construir URL
  const url = buildUrl(endpoint, params);

  // Fazer requisição
  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parsear resposta
    const data: ApiResponse<T> = await response.json();

    // Verificar se houve erro HTTP
    if (!response.ok) {
      // Tratar erro 401 (não autorizado)
      if (response.status === 401) {
        // Limpar token e redirecionar para login
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('codesolve_auth_user');
        
        // Disparar evento customizado para o AuthContext capturar
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { reason: 'token_expired' } 
        }));
      }

      throw new ApiError(
        data.error?.message || 'Erro na requisição',
        data.error?.code || 'UNKNOWN_ERROR',
        response.status,
        data.error?.details
      );
    }

    return data;
  } catch (error) {
    // Se já é um ApiError, repassar
    if (error instanceof ApiError) {
      throw error;
    }

    // Erro de rede ou parsing
    throw new ApiError(
      'Erro de conexão com o servidor. Verifique se o backend está rodando.',
      'NETWORK_ERROR',
      0
    );
  }
}

/**
 * Métodos HTTP convenientes
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'GET', params }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'POST', body, params }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'PUT', body, params }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'PATCH', body, params }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'DELETE', params }),
};

/**
 * URL base da API (exportado para uso em outros módulos)
 */
export { API_BASE_URL };

export default api;
