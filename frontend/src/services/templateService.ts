import { api } from '@/lib/api';
import { NicheTemplate, NicheFAQ } from '@/types/nicheTemplate';

// Cache for templates
let templatesCache: NicheTemplate[] | null = null;

export async function fetchNicheTemplates(): Promise<NicheTemplate[]> {
  if (templatesCache) return templatesCache;
  
  try {
    const response = await api.get('/templates/niche');
    if (response.data.success) {
      templatesCache = response.data.data || [];
      return templatesCache;
    }
    return [];
  } catch (error) {
    console.warn('Templates service not available, using fallback');
    return [];
  }
}

export function getTemplateById(templates: NicheTemplate[], id: string): NicheTemplate | undefined {
  return templates.find(t => t.id === id);
}

export function applyVariablesToPrompt(template: string, variables: Record<string, string>): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || `{{${key}}}`);
  });
  return result;
}

export function clearTemplatesCache(): void {
  templatesCache = null;
}

// Re-export types
export type { NicheTemplate, NicheFAQ };
