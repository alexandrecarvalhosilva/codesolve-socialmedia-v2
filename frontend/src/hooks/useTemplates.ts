import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// ============================================================================
// TYPES
// ============================================================================

export interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  language: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
}

export interface TemplatePreview {
  originalContent: string;
  renderedContent: string;
  variables: string[];
  missingVariables: string[];
}

export interface UseTemplateResult {
  templateId: string;
  templateName: string;
  renderedContent: string;
  usageCount: number;
}

// ============================================================================
// LIST TEMPLATES HOOK
// ============================================================================

interface UseTemplatesFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
}

interface UseTemplatesReturn {
  templates: Template[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTemplates(
  page: number = 1,
  limit: number = 20,
  filters: UseTemplatesFilters = {}
): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, any> = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.isActive !== undefined) params.isActive = filters.isActive;

      const response = await api.get('/templates', { params });
      if (response.data.success) {
        setTemplates(response.data.data.items);
        setTotal(response.data.data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar templates'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters.search, filters.category, filters.isActive]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, total, isLoading, error, refetch: fetchTemplates };
}

// ============================================================================
// GET TEMPLATE HOOK
// ============================================================================

interface UseTemplateReturn {
  template: Template | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTemplate(id: string | null): UseTemplateReturn {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!id) {
      setTemplate(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/templates/${id}`);
      if (response.data.success) {
        setTemplate(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar template'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  return { template, isLoading, error, refetch: fetchTemplate };
}

// ============================================================================
// CREATE TEMPLATE HOOK
// ============================================================================

interface CreateTemplateData {
  name: string;
  category?: string;
  content: string;
  variables?: string[];
  language?: string;
}

interface UseCreateTemplateOptions {
  onSuccess?: (template: Template) => void;
  onError?: (error: Error) => void;
}

interface UseCreateTemplateReturn {
  createTemplate: (data: CreateTemplateData) => Promise<Template | null>;
  isCreating: boolean;
}

export function useCreateTemplate(options: UseCreateTemplateOptions = {}): UseCreateTemplateReturn {
  const [isCreating, setIsCreating] = useState(false);

  const createTemplate = useCallback(async (data: CreateTemplateData) => {
    try {
      setIsCreating(true);
      const response = await api.post('/templates', data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar template');
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [options]);

  return { createTemplate, isCreating };
}

// ============================================================================
// UPDATE TEMPLATE HOOK
// ============================================================================

interface UseUpdateTemplateOptions {
  onSuccess?: (template: Template) => void;
  onError?: (error: Error) => void;
}

interface UseUpdateTemplateReturn {
  updateTemplate: (id: string, data: Partial<Template>) => Promise<Template | null>;
  isUpdating: boolean;
}

export function useUpdateTemplate(options: UseUpdateTemplateOptions = {}): UseUpdateTemplateReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTemplate = useCallback(async (id: string, data: Partial<Template>) => {
    try {
      setIsUpdating(true);
      const response = await api.put(`/templates/${id}`, data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar template');
      options.onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  return { updateTemplate, isUpdating };
}

// ============================================================================
// DELETE TEMPLATE HOOK
// ============================================================================

interface UseDeleteTemplateOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseDeleteTemplateReturn {
  deleteTemplate: (id: string) => Promise<boolean>;
  isDeleting: boolean;
}

export function useDeleteTemplate(options: UseDeleteTemplateOptions = {}): UseDeleteTemplateReturn {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await api.delete(`/templates/${id}`);
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao remover template');
      options.onError?.(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [options]);

  return { deleteTemplate, isDeleting };
}

// ============================================================================
// USE TEMPLATE HOOK (Apply template)
// ============================================================================

interface UseApplyTemplateOptions {
  onSuccess?: (result: UseTemplateResult) => void;
  onError?: (error: Error) => void;
}

interface UseApplyTemplateReturn {
  applyTemplate: (id: string, variables?: Record<string, string>) => Promise<UseTemplateResult | null>;
  isApplying: boolean;
}

export function useApplyTemplate(options: UseApplyTemplateOptions = {}): UseApplyTemplateReturn {
  const [isApplying, setIsApplying] = useState(false);

  const applyTemplate = useCallback(async (id: string, variables?: Record<string, string>) => {
    try {
      setIsApplying(true);
      const response = await api.post(`/templates/${id}/use`, { variables });
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao aplicar template');
      options.onError?.(error);
      throw error;
    } finally {
      setIsApplying(false);
    }
  }, [options]);

  return { applyTemplate, isApplying };
}

// ============================================================================
// TEMPLATE CATEGORIES HOOK
// ============================================================================

interface UseTemplateCategoriesReturn {
  categories: TemplateCategory[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTemplateCategories(): UseTemplateCategoriesReturn {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/templates/meta/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar categorias'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
}

// ============================================================================
// PREVIEW TEMPLATE HOOK
// ============================================================================

interface UsePreviewTemplateReturn {
  preview: TemplatePreview | null;
  previewTemplate: (content: string, variables?: Record<string, string>) => Promise<TemplatePreview | null>;
  isPreviewing: boolean;
}

export function usePreviewTemplate(): UsePreviewTemplateReturn {
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const previewTemplate = useCallback(async (content: string, variables?: Record<string, string>) => {
    try {
      setIsPreviewing(true);
      const response = await api.post('/templates/preview', { content, variables });
      if (response.data.success) {
        setPreview(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Preview template error:', err);
      return null;
    } finally {
      setIsPreviewing(false);
    }
  }, []);

  return { preview, previewTemplate, isPreviewing };
}
