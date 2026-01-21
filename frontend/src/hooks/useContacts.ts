import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// Types
export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  company?: string;
  position?: string;
  notes?: string;
  tags: string[];
  customFields?: Record<string, any>;
  source: 'manual' | 'whatsapp' | 'instagram' | 'import' | 'api' | 'form';
  isActive: boolean;
  isBlocked: boolean;
  lastContactAt?: string;
  lists: { id: string; name: string; color?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isDynamic: boolean;
  dynamicFilters?: Record<string, any>;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// CONTACTS HOOK
// ============================================================================

interface UseContactsOptions {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  source?: string;
  listId?: string;
  isActive?: boolean;
}

interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: (options?: UseContactsOptions) => void;
  createContact: (data: Partial<Contact> & { listIds?: string[] }) => Promise<Contact>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  addToLists: (id: string, listIds: string[]) => Promise<void>;
  removeFromList: (id: string, listId: string) => Promise<void>;
}

export function useContacts(options: UseContactsOptions = {}): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchContacts = useCallback(async (fetchOptions?: UseContactsOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: fetchOptions?.page || options.page || 1,
        limit: fetchOptions?.limit || options.limit || 20,
        search: fetchOptions?.search || options.search,
        tags: fetchOptions?.tags?.join(',') || options.tags?.join(','),
        source: fetchOptions?.source || options.source,
        listId: fetchOptions?.listId || options.listId,
        isActive: fetchOptions?.isActive ?? options.isActive,
      };

      const response = await api.get('/contacts', { params });
      
      if (response.data.success) {
        setContacts(response.data.data.items || []);
        setMeta({
          total: response.data.data.total,
          page: response.data.data.page,
          limit: response.data.data.limit,
          hasMore: response.data.data.hasMore,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar contatos'));
    } finally {
      setIsLoading(false);
    }
  }, [options.page, options.limit, options.search, options.tags, options.source, options.listId, options.isActive]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = useCallback(async (data: Partial<Contact> & { listIds?: string[] }) => {
    const response = await api.post('/contacts', data);
    if (response.data.success) {
      await fetchContacts();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao criar contato');
  }, [fetchContacts]);

  const updateContact = useCallback(async (id: string, data: Partial<Contact>) => {
    const response = await api.put(`/contacts/${id}`, data);
    if (response.data.success) {
      await fetchContacts();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao atualizar contato');
  }, [fetchContacts]);

  const deleteContact = useCallback(async (id: string) => {
    const response = await api.delete(`/contacts/${id}`);
    if (response.data.success) {
      await fetchContacts();
      return;
    }
    throw new Error(response.data.error?.message || 'Erro ao remover contato');
  }, [fetchContacts]);

  const addToLists = useCallback(async (id: string, listIds: string[]) => {
    const response = await api.post(`/contacts/${id}/lists`, { listIds });
    if (response.data.success) {
      await fetchContacts();
      return;
    }
    throw new Error(response.data.error?.message || 'Erro ao adicionar às listas');
  }, [fetchContacts]);

  const removeFromList = useCallback(async (id: string, listId: string) => {
    const response = await api.delete(`/contacts/${id}/lists/${listId}`);
    if (response.data.success) {
      await fetchContacts();
      return;
    }
    throw new Error(response.data.error?.message || 'Erro ao remover da lista');
  }, [fetchContacts]);

  return {
    contacts,
    isLoading,
    error,
    meta,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    addToLists,
    removeFromList,
  };
}

// ============================================================================
// CONTACT BY ID HOOK
// ============================================================================

interface UseContactReturn {
  contact: Contact | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useContact(id: string | undefined): UseContactReturn {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContact = useCallback(async () => {
    if (!id) {
      setContact(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/contacts/${id}`);
      if (response.data.success) {
        setContact(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar contato'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return { contact, isLoading, error, refetch: fetchContact };
}

// ============================================================================
// CONTACT LISTS HOOK
// ============================================================================

interface UseContactListsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

interface UseContactListsReturn {
  lists: ContactList[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: (options?: UseContactListsOptions) => void;
  createList: (data: Partial<ContactList>) => Promise<ContactList>;
  updateList: (id: string, data: Partial<ContactList>) => Promise<ContactList>;
  deleteList: (id: string) => Promise<void>;
}

export function useContactLists(options: UseContactListsOptions = {}): UseContactListsReturn {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchLists = useCallback(async (fetchOptions?: UseContactListsOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: fetchOptions?.page || options.page || 1,
        limit: fetchOptions?.limit || options.limit || 20,
        search: fetchOptions?.search || options.search,
      };

      const response = await api.get('/contacts/lists', { params });
      
      if (response.data.success) {
        setLists(response.data.data.items || []);
        setMeta({
          total: response.data.data.total,
          page: response.data.data.page,
          limit: response.data.data.limit,
          hasMore: response.data.data.hasMore,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar listas'));
    } finally {
      setIsLoading(false);
    }
  }, [options.page, options.limit, options.search]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = useCallback(async (data: Partial<ContactList>) => {
    const response = await api.post('/contacts/lists', data);
    if (response.data.success) {
      await fetchLists();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao criar lista');
  }, [fetchLists]);

  const updateList = useCallback(async (id: string, data: Partial<ContactList>) => {
    const response = await api.put(`/contacts/lists/${id}`, data);
    if (response.data.success) {
      await fetchLists();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao atualizar lista');
  }, [fetchLists]);

  const deleteList = useCallback(async (id: string) => {
    const response = await api.delete(`/contacts/lists/${id}`);
    if (response.data.success) {
      await fetchLists();
      return;
    }
    throw new Error(response.data.error?.message || 'Erro ao remover lista');
  }, [fetchLists]);

  return {
    lists,
    isLoading,
    error,
    meta,
    refetch: fetchLists,
    createList,
    updateList,
    deleteList,
  };
}

// ============================================================================
// LIST MEMBERS HOOK
// ============================================================================

interface UseListMembersOptions {
  page?: number;
  limit?: number;
}

interface ListMember {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  addedAt: string;
}

interface UseListMembersReturn {
  list: { id: string; name: string; memberCount: number } | null;
  members: ListMember[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: (options?: UseListMembersOptions) => void;
}

export function useListMembers(listId: string | undefined, options: UseListMembersOptions = {}): UseListMembersReturn {
  const [list, setList] = useState<{ id: string; name: string; memberCount: number } | null>(null);
  const [members, setMembers] = useState<ListMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchMembers = useCallback(async (fetchOptions?: UseListMembersOptions) => {
    if (!listId) {
      setList(null);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: fetchOptions?.page || options.page || 1,
        limit: fetchOptions?.limit || options.limit || 20,
      };

      const response = await api.get(`/contacts/lists/${listId}/members`, { params });
      
      if (response.data.success) {
        setList(response.data.data.list);
        setMembers(response.data.data.items || []);
        setMeta({
          total: response.data.data.total,
          page: response.data.data.page,
          limit: response.data.data.limit,
          hasMore: response.data.data.hasMore,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar membros'));
    } finally {
      setIsLoading(false);
    }
  }, [listId, options.page, options.limit]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { list, members, isLoading, error, meta, refetch: fetchMembers };
}

// ============================================================================
// IMPORT CONTACTS HOOK
// ============================================================================

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

interface UseImportContactsReturn {
  importContacts: (contacts: Partial<Contact>[], listId?: string, skipDuplicates?: boolean) => Promise<ImportResult>;
  isImporting: boolean;
  error: Error | null;
}

export function useImportContacts(): UseImportContactsReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const importContacts = useCallback(async (
    contacts: Partial<Contact>[],
    listId?: string,
    skipDuplicates: boolean = true
  ): Promise<ImportResult> => {
    try {
      setIsImporting(true);
      setError(null);
      
      const response = await api.post('/contacts/import', {
        contacts,
        listId,
        skipDuplicates,
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error?.message || 'Erro ao importar contatos');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao importar contatos');
      setError(error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  return { importContacts, isImporting, error };
}
