// Tipos para templates de nicho gerenciados pelo SuperAdmin

export interface NicheVariable {
  key: string;           // Ex: {{nome_agente}}
  label: string;         // Ex: "Nome do Agente/Secretária"
  placeholder: string;   // Ex: "AKIRA"
  description: string;   // Ex: "Nome que o assistente usará para se identificar"
  type: 'text' | 'textarea' | 'list';
  required: boolean;
}

export interface NicheFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isDefault: boolean;   // true = veio do template, false = criado pelo tenant
}

export interface NicheTemplate {
  id: string;
  name: string;           // Ex: "Academia de Jiu-Jitsu"
  icon: string;           // Emoji
  category: string;       // Ex: "academia", "clinica"
  description: string;
  promptTemplate: string; // Prompt com variáveis {{...}}
  variables: NicheVariable[];
  defaultFAQs: NicheFAQ[];
  isActive: boolean;
  createdBy: string;      // superadmin id
  createdAt: string;
  updatedAt: string;
  tenantsUsing?: number;  // Quantidade de tenants usando este template
  tenantNames?: string[]; // Nomes dos tenants usando este template
  tenantIds?: string[];   // IDs dos tenants para navegação
}

export interface TenantOnboardingData {
  // Step 1: OpenAI
  openaiApiKey: string;
  openaiModel: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  
  // Step 2: WhatsApp
  whatsappInstances: {
    id: string;
    name: string;
    phone: string;
    status: 'pending' | 'connected' | 'disconnected';
  }[];
  
  // Step 3: Nicho e Prompt
  selectedNicheId: string | 'custom';
  customPrompt?: string;
  variableValues: Record<string, string>; // { "nome_agente": "AKIRA", ... }
  
  // Step 4: FAQs
  faqs: NicheFAQ[];
}

export type OnboardingStep = 'openai' | 'whatsapp' | 'niche' | 'faq' | 'complete';
