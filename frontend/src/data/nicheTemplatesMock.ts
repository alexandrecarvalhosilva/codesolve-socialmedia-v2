import { NicheTemplate, NicheFAQ } from '@/types/nicheTemplate';

// Templates de nichos pré-definidos pelo SuperAdmin
export const nicheTemplates: NicheTemplate[] = [
  {
    id: 'academia-jiu-jitsu',
    name: 'Academia de Jiu-Jitsu',
    icon: '🥋',
    category: 'academia',
    description: 'Template para academias de artes marciais como Jiu-Jitsu, Judô, MMA, etc.',
    promptTemplate: `════════════════════════════════════
IDENTIDADE DO AGENTE
════════════════════════════════════

Você é {{nome_agente}}, a secretária virtual oficial da {{nome_empresa}}.

{{nome_agente}} representa exclusivamente a {{nome_empresa}}.
{{nome_agente}} existe apenas para conversar sobre assuntos relacionados à academia.
{{nome_agente}} não improvisa, não opina, não cria regras, não faz promessas e não sai do nicho.

════════════════════════════════════
MISSÃO
════════════════════════════════════

Atender automaticamente alunos, pais e interessados pelo WhatsApp, fornecendo informações claras, corretas, consistentes e padronizadas sobre a {{nome_empresa}}.

{{nome_agente}} conversa SOMENTE sobre:
- Funcionamento da academia
- Horários
- Valores
- Regras
- Uniforme
- Aulas experimentais
- Público Kids e Adultos
- Primeiros passos no Jiu-Jitsu dentro da academia

════════════════════════════════════
TOM, LINGUAGEM E ESTILO
════════════════════════════════════

- Português do Brasil
- Linguagem educada, clara, objetiva e acolhedora
- Comunicação profissional, amigável e respeitosa
- Mensagens curtas e bem organizadas
- Uma ideia principal por mensagem
- No máximo UMA pergunta por resposta
- Emojis permitidos com moderação (máx. 1)

════════════════════════════════════
HORÁRIOS E VALORES
════════════════════════════════════

{{horarios_valores}}

════════════════════════════════════
REGRAS DA ACADEMIA
════════════════════════════════════

{{regras}}

════════════════════════════════════
REGRAS DE SEGURANÇA
════════════════════════════════════

- Nunca inventar informações
- Nunca sair do nicho da academia
- Nunca encaminhar para atendimento humano
- Nunca prometer resultados, graduação ou desempenho
- Nunca criar exceções ou flexibilizações

Agora responda SEMPRE como {{nome_agente}}, obedecendo rigorosamente TODAS as regras acima.`,
    variables: [
      {
        key: 'nome_agente',
        label: 'Nome do Agente/Secretária',
        placeholder: 'AKIRA',
        description: 'Nome que o assistente virtual usará para se identificar',
        type: 'text',
        required: true,
      },
      {
        key: 'nome_empresa',
        label: 'Nome da Academia',
        placeholder: 'Six Blades Lago Oeste',
        description: 'Nome completo da sua academia',
        type: 'text',
        required: true,
      },
      {
        key: 'horarios_valores',
        label: 'Horários e Valores',
        placeholder: `Kids: Seg, Qua, Sex - 19:00 às 20:00
Adultos: Seg, Qua, Sex - 06:15–07:15 | 12:15–13:30 | 20:15–21:30

Valores:
• Até o dia 10: R$ 100
• Após o dia 10: R$ 130`,
        description: 'Informe os horários das turmas e valores de mensalidade',
        type: 'textarea',
        required: true,
      },
      {
        key: 'regras',
        label: 'Regras da Academia',
        placeholder: `• Respeito no tatame
• Cumprimentar ao entrar e sair
• Unhas sempre cortadas
• Sem acessórios
• Kimono sempre limpo`,
        description: 'Regras principais que os alunos devem seguir',
        type: 'textarea',
        required: true,
      },
    ],
    defaultFAQs: [
      {
        id: 'faq-1',
        question: 'Qual o valor da mensalidade?',
        answer: 'Os valores são informados conforme a modalidade e turma escolhida. Entre em contato para saber os valores atualizados.',
        category: 'precos',
        isDefault: true,
      },
      {
        id: 'faq-2',
        question: 'Quais são os horários das aulas?',
        answer: 'Temos turmas em diferentes horários. Por favor, consulte nossa tabela de horários atualizada.',
        category: 'horarios',
        isDefault: true,
      },
      {
        id: 'faq-3',
        question: 'Posso fazer aula experimental?',
        answer: 'Sim! Oferecemos aulas experimentais gratuitas. Basta agendar com antecedência.',
        category: 'servicos',
        isDefault: true,
      },
      {
        id: 'faq-4',
        question: 'Preciso ter kimono?',
        answer: 'Para as primeiras aulas experimentais não é necessário. Após a matrícula, o kimono é obrigatório.',
        category: 'uniforme',
        isDefault: true,
      },
      {
        id: 'faq-5',
        question: 'Quais cores de kimono são permitidas?',
        answer: 'Consulte as regras da academia sobre cores permitidas de kimono.',
        category: 'uniforme',
        isDefault: true,
      },
    ],
    isActive: true,
    createdBy: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tenantsUsing: 5,
    tenantNames: ['Six Blades Lago Oeste', 'Gracie Barra DF', 'Alliance JJ', 'CheckMat SP', 'Nova União RJ'],
    tenantIds: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'clinica-medica',
    name: 'Clínica Médica',
    icon: '🏥',
    category: 'clinica',
    description: 'Template para clínicas médicas, consultórios e centros de saúde.',
    promptTemplate: `════════════════════════════════════
IDENTIDADE DO AGENTE
════════════════════════════════════

Você é {{nome_agente}}, o(a) assistente virtual oficial da {{nome_empresa}}.

{{nome_agente}} representa exclusivamente a {{nome_empresa}}.
{{nome_agente}} existe apenas para atender sobre assuntos relacionados à clínica.
{{nome_agente}} NÃO fornece diagnósticos, orientações médicas ou prescrições.

════════════════════════════════════
MISSÃO
════════════════════════════════════

Atender pacientes e interessados pelo WhatsApp, auxiliando com:
- Agendamento de consultas
- Informações sobre especialidades
- Horários de funcionamento
- Valores e formas de pagamento
- Convênios aceitos
- Localização e como chegar

════════════════════════════════════
TOM E LINGUAGEM
════════════════════════════════════

- Português do Brasil
- Linguagem acolhedora e profissional
- Empatia com o paciente
- Respostas claras e objetivas
- Máximo 1 emoji por mensagem

════════════════════════════════════
INFORMAÇÕES DA CLÍNICA
════════════════════════════════════

Especialidades: {{especialidades}}

Horário de funcionamento: {{horarios_valores}}

Convênios: {{convenios}}

════════════════════════════════════
REGRAS DE SEGURANÇA
════════════════════════════════════

- NUNCA dar diagnósticos ou orientações médicas
- NUNCA prescrever medicamentos
- NUNCA interpretar exames
- Sempre orientar a procurar um profissional para questões de saúde

Agora responda SEMPRE como {{nome_agente}}.`,
    variables: [
      {
        key: 'nome_agente',
        label: 'Nome do Assistente',
        placeholder: 'Sofia',
        description: 'Nome que o assistente virtual usará',
        type: 'text',
        required: true,
      },
      {
        key: 'nome_empresa',
        label: 'Nome da Clínica',
        placeholder: 'Clínica Saúde & Vida',
        description: 'Nome completo da sua clínica',
        type: 'text',
        required: true,
      },
      {
        key: 'especialidades',
        label: 'Especialidades',
        placeholder: 'Clínico Geral, Cardiologia, Dermatologia, Ortopedia',
        description: 'Liste as especialidades atendidas',
        type: 'textarea',
        required: true,
      },
      {
        key: 'horarios_valores',
        label: 'Horários e Valores',
        placeholder: `Segunda a Sexta: 08:00 às 18:00
Sábados: 08:00 às 12:00

Consultas a partir de R$ 150,00`,
        description: 'Horários de funcionamento e valores das consultas',
        type: 'textarea',
        required: true,
      },
      {
        key: 'convenios',
        label: 'Convênios Aceitos',
        placeholder: 'Unimed, Bradesco Saúde, SulAmérica, Particular',
        description: 'Liste os convênios aceitos',
        type: 'text',
        required: false,
      },
    ],
    defaultFAQs: [
      {
        id: 'faq-c1',
        question: 'Como faço para agendar uma consulta?',
        answer: 'Você pode agendar sua consulta diretamente por aqui informando a especialidade desejada e sua disponibilidade.',
        category: 'agendamento',
        isDefault: true,
      },
      {
        id: 'faq-c2',
        question: 'Quais convênios vocês aceitam?',
        answer: 'Trabalhamos com os principais convênios. Informe seu plano para verificarmos a cobertura.',
        category: 'convenios',
        isDefault: true,
      },
      {
        id: 'faq-c3',
        question: 'Qual o valor da consulta particular?',
        answer: 'Os valores variam conforme a especialidade. Posso verificar para você.',
        category: 'precos',
        isDefault: true,
      },
    ],
    isActive: true,
    createdBy: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tenantsUsing: 3,
    tenantNames: ['Clínica Saúde & Vida', 'Centro Médico Esperança', 'Consultório Dr. Silva'],
    tenantIds: ['6', '7', '8'],
  },
  {
    id: 'delivery-restaurante',
    name: 'Delivery / Restaurante',
    icon: '🍕',
    category: 'delivery',
    description: 'Template para restaurantes, pizzarias, lanchonetes e delivery.',
    promptTemplate: `════════════════════════════════════
IDENTIDADE DO AGENTE
════════════════════════════════════

Você é {{nome_agente}}, o(a) assistente virtual do {{nome_empresa}}.

{{nome_agente}} auxilia clientes com:
- Cardápio e preços
- Pedidos
- Horário de funcionamento
- Área de entrega
- Tempo de entrega
- Formas de pagamento

════════════════════════════════════
TOM E LINGUAGEM
════════════════════════════════════

- Simpático e animado
- Linguagem casual mas respeitosa
- Pode usar emojis com moderação 🍕
- Respostas objetivas

════════════════════════════════════
INFORMAÇÕES DO ESTABELECIMENTO
════════════════════════════════════

Horário de funcionamento: {{horarios_valores}}

Área de entrega: {{area_entrega}}

Tempo médio de entrega: {{tempo_entrega}}

════════════════════════════════════
CARDÁPIO RESUMIDO
════════════════════════════════════

{{cardapio}}

Agora responda SEMPRE como {{nome_agente}}.`,
    variables: [
      {
        key: 'nome_agente',
        label: 'Nome do Assistente',
        placeholder: 'Bia',
        description: 'Nome do assistente virtual',
        type: 'text',
        required: true,
      },
      {
        key: 'nome_empresa',
        label: 'Nome do Estabelecimento',
        placeholder: 'Pizzaria do Zé',
        description: 'Nome do seu restaurante/delivery',
        type: 'text',
        required: true,
      },
      {
        key: 'horarios_valores',
        label: 'Horário de Funcionamento',
        placeholder: `Ter a Dom: 18:00 às 23:00
Segunda: Fechado`,
        description: 'Dias e horários de funcionamento',
        type: 'textarea',
        required: true,
      },
      {
        key: 'area_entrega',
        label: 'Área de Entrega',
        placeholder: 'Até 5km do centro - Taxa R$ 5,00',
        description: 'Região atendida e taxa de entrega',
        type: 'text',
        required: true,
      },
      {
        key: 'tempo_entrega',
        label: 'Tempo de Entrega',
        placeholder: '30 a 45 minutos',
        description: 'Tempo médio de entrega',
        type: 'text',
        required: true,
      },
      {
        key: 'cardapio',
        label: 'Cardápio Resumido',
        placeholder: `PIZZAS:
• Marguerita - R$ 45
• Calabresa - R$ 40
• 4 Queijos - R$ 50

BEBIDAS:
• Refrigerante 2L - R$ 12
• Suco Natural - R$ 8`,
        description: 'Principais itens e preços',
        type: 'textarea',
        required: true,
      },
    ],
    defaultFAQs: [
      {
        id: 'faq-d1',
        question: 'Qual o tempo de entrega?',
        answer: 'O tempo médio de entrega é informado no momento do pedido, variando conforme a demanda.',
        category: 'entrega',
        isDefault: true,
      },
      {
        id: 'faq-d2',
        question: 'Vocês aceitam cartão?',
        answer: 'Sim! Aceitamos cartões de crédito e débito, PIX e dinheiro.',
        category: 'pagamento',
        isDefault: true,
      },
      {
        id: 'faq-d3',
        question: 'Qual a taxa de entrega?',
        answer: 'A taxa de entrega varia conforme a localização. Informe seu endereço para calcularmos.',
        category: 'entrega',
        isDefault: true,
      },
    ],
    isActive: true,
    createdBy: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tenantsUsing: 2,
    tenantNames: ['Pizzaria do Zé', 'Sushi Express'],
    tenantIds: ['9', '10'],
  },
  {
    id: 'ecommerce-loja',
    name: 'E-commerce / Loja Online',
    icon: '🛒',
    category: 'ecommerce',
    description: 'Template para lojas online, e-commerces e marketplaces.',
    promptTemplate: `════════════════════════════════════
IDENTIDADE DO AGENTE
════════════════════════════════════

Você é {{nome_agente}}, assistente virtual da {{nome_empresa}}.

Você ajuda clientes com:
- Informações sobre produtos
- Status de pedidos
- Trocas e devoluções
- Formas de pagamento
- Prazos de entrega
- Dúvidas gerais

════════════════════════════════════
TOM E LINGUAGEM
════════════════════════════════════

- Profissional e prestativo
- Foco em resolver o problema do cliente
- Respostas claras e objetivas

════════════════════════════════════
POLÍTICAS DA LOJA
════════════════════════════════════

{{politicas}}

════════════════════════════════════
FORMAS DE PAGAMENTO
════════════════════════════════════

{{formas_pagamento}}

Agora responda SEMPRE como {{nome_agente}}.`,
    variables: [
      {
        key: 'nome_agente',
        label: 'Nome do Assistente',
        placeholder: 'Luna',
        description: 'Nome do assistente virtual',
        type: 'text',
        required: true,
      },
      {
        key: 'nome_empresa',
        label: 'Nome da Loja',
        placeholder: 'TechStore Brasil',
        description: 'Nome da sua loja',
        type: 'text',
        required: true,
      },
      {
        key: 'politicas',
        label: 'Políticas de Troca/Devolução',
        placeholder: `• Troca em até 7 dias após recebimento
• Produto deve estar lacrado
• Devolução com frete grátis`,
        description: 'Regras de troca e devolução',
        type: 'textarea',
        required: true,
      },
      {
        key: 'formas_pagamento',
        label: 'Formas de Pagamento',
        placeholder: `• Cartão de crédito em até 12x
• PIX com 5% de desconto
• Boleto bancário`,
        description: 'Formas de pagamento aceitas',
        type: 'textarea',
        required: true,
      },
    ],
    defaultFAQs: [
      {
        id: 'faq-e1',
        question: 'Qual o prazo de entrega?',
        answer: 'O prazo varia conforme sua localização. Informe seu CEP para calcularmos.',
        category: 'entrega',
        isDefault: true,
      },
      {
        id: 'faq-e2',
        question: 'Como rastreio meu pedido?',
        answer: 'Você pode rastrear seu pedido usando o código de rastreamento enviado por email.',
        category: 'pedido',
        isDefault: true,
      },
      {
        id: 'faq-e3',
        question: 'Como faço para trocar um produto?',
        answer: 'Para trocas, entre em contato em até 7 dias após o recebimento com o produto lacrado.',
        category: 'trocas',
        isDefault: true,
      },
    ],
    isActive: true,
    createdBy: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tenantsUsing: 1,
    tenantNames: ['TechStore Brasil'],
    tenantIds: ['11'],
  },
  {
    id: 'custom',
    name: 'Personalizado',
    icon: '✨',
    category: 'outro',
    description: 'Crie seu próprio prompt do zero, sem template pré-definido.',
    promptTemplate: `Você é {{nome_agente}}, o(a) assistente virtual da {{nome_empresa}}.

Sua função é atender clientes de forma profissional e prestativa.

[Adicione aqui as instruções específicas para seu negócio]`,
    variables: [
      {
        key: 'nome_agente',
        label: 'Nome do Assistente',
        placeholder: 'Assistente',
        description: 'Nome que o assistente usará',
        type: 'text',
        required: true,
      },
      {
        key: 'nome_empresa',
        label: 'Nome da Empresa',
        placeholder: 'Sua Empresa',
        description: 'Nome do seu negócio',
        type: 'text',
        required: true,
      },
    ],
    defaultFAQs: [],
    isActive: true,
    createdBy: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tenantsUsing: 1,
    tenantNames: ['Empresa XYZ'],
    tenantIds: ['12'],
  },
];

// Função para obter template por categoria
export function getTemplatesByCategory(category: string): NicheTemplate[] {
  return nicheTemplates.filter(t => t.category === category && t.isActive);
}

// Função para obter template por ID
export function getTemplateById(id: string): NicheTemplate | undefined {
  return nicheTemplates.find(t => t.id === id);
}

// Função para aplicar variáveis ao prompt
export function applyVariablesToPrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// Mapear categorias do registro para templates disponíveis
export const categoryToTemplateMap: Record<string, string[]> = {
  'academia': ['academia-jiu-jitsu'],
  'clinica': ['clinica-medica'],
  'delivery': ['delivery-restaurante'],
  'ecommerce': ['ecommerce-loja'],
  'imobiliaria': [],
  'escritorio': [],
  'educacao': [],
  'beleza': [],
  'outro': ['custom'],
};
