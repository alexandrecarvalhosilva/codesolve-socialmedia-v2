import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // ============================================================================
  // 1. BILLING PLANS
  // ============================================================================
  const plans = [
    {
      id: uuidv4(),
      slug: 'free',
      name: 'Free',
      description: 'Plano gratuito para começar',
      priceMonthly: 0,
      priceQuarterly: 0,
      priceSemiannual: 0,
      priceAnnual: 0,
      maxWhatsappInstances: 1,
      maxMessagesPerMonth: 500,
      maxUsers: 2,
      maxAiTokensPerMonth: 0,
      maxActiveAutomations: 0,
      maxStorageBytes: BigInt(500 * 1024 * 1024), // 500MB
      hasAi: false,
      hasAutomations: false,
      hasCalendarSync: false,
      hasPrioritySupport: false,
      isActive: true,
      isPublic: true,
      sortOrder: 1,
    },
    {
      id: uuidv4(),
      slug: 'starter',
      name: 'Starter',
      description: 'Ideal para pequenos negócios',
      priceMonthly: 9900,
      priceQuarterly: 26700,
      priceSemiannual: 50400,
      priceAnnual: 95000,
      maxWhatsappInstances: 2,
      maxMessagesPerMonth: 5000,
      maxUsers: 5,
      maxAiTokensPerMonth: 50000,
      maxActiveAutomations: 5,
      maxStorageBytes: BigInt(2 * 1024 * 1024 * 1024), // 2GB
      hasAi: true,
      hasAutomations: true,
      hasCalendarSync: false,
      hasPrioritySupport: false,
      isActive: true,
      isPublic: true,
      sortOrder: 2,
    },
    {
      id: uuidv4(),
      slug: 'professional',
      name: 'Professional',
      description: 'Para empresas em crescimento',
      priceMonthly: 19900,
      priceQuarterly: 53700,
      priceSemiannual: 101400,
      priceAnnual: 191000,
      maxWhatsappInstances: 5,
      maxMessagesPerMonth: 20000,
      maxUsers: 15,
      maxAiTokensPerMonth: 200000,
      maxActiveAutomations: 20,
      maxStorageBytes: BigInt(10 * 1024 * 1024 * 1024), // 10GB
      hasAi: true,
      hasAutomations: true,
      hasCalendarSync: true,
      hasPrioritySupport: false,
      isActive: true,
      isPublic: true,
      sortOrder: 3,
    },
    {
      id: uuidv4(),
      slug: 'enterprise',
      name: 'Enterprise',
      description: 'Solução completa para grandes empresas',
      priceMonthly: 49900,
      priceQuarterly: 134700,
      priceSemiannual: 254400,
      priceAnnual: 479000,
      maxWhatsappInstances: 20,
      maxMessagesPerMonth: 100000,
      maxUsers: 50,
      maxAiTokensPerMonth: 1000000,
      maxActiveAutomations: 100,
      maxStorageBytes: BigInt(50 * 1024 * 1024 * 1024), // 50GB
      hasAi: true,
      hasAutomations: true,
      hasCalendarSync: true,
      hasPrioritySupport: true,
      isActive: true,
      isPublic: true,
      sortOrder: 4,
    },
  ];

  for (const plan of plans) {
    await prisma.billingPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
  console.log('✅ Plans created');

  const starterPlan = await prisma.billingPlan.findUnique({ where: { slug: 'starter' } });
  const professionalPlan = await prisma.billingPlan.findUnique({ where: { slug: 'professional' } });
  const enterprisePlan = await prisma.billingPlan.findUnique({ where: { slug: 'enterprise' } });

  // ============================================================================
  // 2. BILLING MODULES
  // ============================================================================
  const modules = [
    {
      id: uuidv4(),
      slug: 'extra-whatsapp',
      name: 'WhatsApp Adicional',
      description: 'Instância adicional de WhatsApp',
      price: 2900,
      isRecurring: true,
      isPerUnit: true,
      category: 'communication' as const,
      iconName: 'whatsapp',
      sortOrder: 1,
    },
    {
      id: uuidv4(),
      slug: 'extra-users',
      name: 'Usuários Adicionais',
      description: 'Pacote de 5 usuários adicionais',
      price: 4900,
      isRecurring: true,
      isPerUnit: true,
      category: 'core' as const,
      iconName: 'users',
      sortOrder: 2,
    },
    {
      id: uuidv4(),
      slug: 'ai-tokens',
      name: 'Tokens de IA',
      description: 'Pacote de 100.000 tokens adicionais',
      price: 1900,
      isRecurring: true,
      isPerUnit: true,
      category: 'ai' as const,
      iconName: 'brain',
      sortOrder: 3,
    },
    {
      id: uuidv4(),
      slug: 'priority-support',
      name: 'Suporte Prioritário',
      description: 'Atendimento prioritário via chat e telefone',
      price: 9900,
      isRecurring: true,
      isPerUnit: false,
      category: 'core' as const,
      iconName: 'headset',
      sortOrder: 4,
    },
  ];

  for (const module of modules) {
    await prisma.billingModule.upsert({
      where: { slug: module.slug },
      update: module,
      create: module,
    });
  }
  console.log('✅ Billing modules created');

  // ============================================================================
  // 3. SUPER ADMIN USER
  // ============================================================================
  const superAdminPassword = await bcrypt.hash('Admin@123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@codesolve.com.br' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@codesolve.com.br',
      passwordHash: superAdminPassword,
      name: 'Super Admin',
      role: 'superadmin',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ SuperAdmin created: admin@codesolve.com.br / Admin@123');

  // ============================================================================
  // 4. DEMO TENANTS WITH USERS
  // ============================================================================
  
  // Tenant 1: Tech Solutions (Professional Plan)
  const tenant1Id = uuidv4();
  const tenant1 = await prisma.tenant.create({
    data: {
      id: tenant1Id,
      name: 'Tech Solutions Ltda',
      slug: 'tech-solutions',
      domain: 'techsolutions.com.br',
      status: 'active',
      planId: professionalPlan?.id,
      billingCycle: 'monthly',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      niche: 'Tecnologia',
    },
  });

  const tenant1AdminPassword = await bcrypt.hash('Tech@123', 12);
  const tenant1Admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@techsolutions.com.br',
      passwordHash: tenant1AdminPassword,
      name: 'Carlos Silva',
      phone: '+5511999887766',
      role: 'admin',
      tenantId: tenant1Id,
      isActive: true,
      emailVerified: true,
    },
  });

  const tenant1Op1Password = await bcrypt.hash('Operador@123', 12);
  const tenant1Op1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'maria@techsolutions.com.br',
      passwordHash: tenant1Op1Password,
      name: 'Maria Santos',
      phone: '+5511988776655',
      role: 'operador',
      tenantId: tenant1Id,
      isActive: true,
      emailVerified: true,
    },
  });

  const tenant1Op2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'joao@techsolutions.com.br',
      passwordHash: tenant1Op1Password,
      name: 'João Oliveira',
      phone: '+5511977665544',
      role: 'operador',
      tenantId: tenant1Id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Tenant 1 (Tech Solutions) created with 3 users');

  // Tenant 2: Fitness Pro (Starter Plan)
  const tenant2Id = uuidv4();
  const tenant2 = await prisma.tenant.create({
    data: {
      id: tenant2Id,
      name: 'Fitness Pro Academia',
      slug: 'fitness-pro',
      status: 'active',
      planId: starterPlan?.id,
      billingCycle: 'monthly',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      niche: 'Fitness',
    },
  });

  const tenant2AdminPassword = await bcrypt.hash('Fitness@123', 12);
  const tenant2Admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@fitnesspro.com.br',
      passwordHash: tenant2AdminPassword,
      name: 'Roberto Almeida',
      phone: '+5521999112233',
      role: 'admin',
      tenantId: tenant2Id,
      isActive: true,
      emailVerified: true,
    },
  });

  const tenant2Op1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'atendimento@fitnesspro.com.br',
      passwordHash: tenant1Op1Password,
      name: 'Ana Paula Costa',
      phone: '+5521988223344',
      role: 'operador',
      tenantId: tenant2Id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Tenant 2 (Fitness Pro) created with 2 users');

  // Tenant 3: Clínica Saúde (Enterprise Plan - Trial)
  const tenant3Id = uuidv4();
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);
  
  const tenant3 = await prisma.tenant.create({
    data: {
      id: tenant3Id,
      name: 'Clínica Saúde Total',
      slug: 'clinica-saude',
      status: 'trial',
      planId: enterprisePlan?.id,
      billingCycle: 'annual',
      trialEndsAt: trialEndsAt,
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      niche: 'Saúde',
    },
  });

  const tenant3AdminPassword = await bcrypt.hash('Clinica@123', 12);
  const tenant3Admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'dr.fernanda@clinicasaude.com.br',
      passwordHash: tenant3AdminPassword,
      name: 'Dra. Fernanda Lima',
      phone: '+5531999445566',
      role: 'admin',
      tenantId: tenant3Id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Tenant 3 (Clínica Saúde) created in trial mode');

  // ============================================================================
  // 5. WHATSAPP INSTANCES
  // ============================================================================
  const whatsappInstance1 = await prisma.whatsappInstance.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      name: 'Atendimento Principal',
      phoneNumber: '+5511999887766',
      status: 'connected',
      evolutionInstanceId: 'tech-solutions-main',
      apiKeyEncrypted: 'evo_key_' + uuidv4().substring(0, 8),
      connectedAt: new Date(),
    },
  });

  const whatsappInstance2 = await prisma.whatsappInstance.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      name: 'Vendas',
      phoneNumber: '+5511988776655',
      status: 'connected',
      evolutionInstanceId: 'tech-solutions-sales',
      apiKeyEncrypted: 'evo_key_' + uuidv4().substring(0, 8),
      connectedAt: new Date(),
    },
  });

  const whatsappInstance3 = await prisma.whatsappInstance.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      name: 'WhatsApp Academia',
      phoneNumber: '+5521999112233',
      status: 'connected',
      evolutionInstanceId: 'fitness-pro-main',
      apiKeyEncrypted: 'evo_key_' + uuidv4().substring(0, 8),
      connectedAt: new Date(),
    },
  });

  const whatsappInstance4 = await prisma.whatsappInstance.create({
    data: {
      id: uuidv4(),
      tenantId: tenant3Id,
      name: 'Agendamentos',
      phoneNumber: '+5531999445566',
      status: 'disconnected',
      evolutionInstanceId: 'clinica-saude-main',
      apiKeyEncrypted: 'evo_key_' + uuidv4().substring(0, 8),
    },
  });

  console.log('✅ WhatsApp instances created');

  // ============================================================================
  // 6. CONVERSATIONS AND MESSAGES (Tenant 1)
  // ============================================================================
  const contactsData = [
    { name: 'Pedro Henrique', phone: '+5511991234567' },
    { name: 'Juliana Mendes', phone: '+5511992345678' },
    { name: 'Ricardo Souza', phone: '+5511993456789' },
    { name: 'Camila Ferreira', phone: '+5511994567890' },
    { name: 'Lucas Martins', phone: '+5511995678901' },
  ];

  const conversations1: any[] = [];
  const assignees = [tenant1Admin.id, tenant1Op1.id, tenant1Op2.id];

  for (let i = 0; i < contactsData.length; i++) {
    const contact = contactsData[i];
    const conversation = await prisma.conversation.create({
      data: {
        id: uuidv4(),
        tenantId: tenant1Id,
        channel: 'whatsapp',
        whatsappInstanceId: whatsappInstance1.id,
        contactPhone: contact.phone,
        contactName: contact.name,
        contactEmail: contact.name.toLowerCase().replace(' ', '.') + '@email.com',
        status: i < 3 ? 'open' : 'closed',
        priority: i === 0 ? 'high' : 'normal',
        assignedToId: assignees[i % assignees.length],
        lastMessageAt: new Date(Date.now() - i * 3600000),
        closedAt: i >= 3 ? new Date(Date.now() - i * 1800000) : null,
        tags: ['cliente'],
      },
    });
    conversations1.push(conversation);

    // Create messages for each conversation
    const messageTemplates = [
      { direction: 'inbound', content: 'Olá, gostaria de mais informações sobre os serviços.' },
      { direction: 'outbound', content: 'Olá! Claro, como posso ajudar?' },
      { direction: 'inbound', content: 'Qual o valor do plano mensal?' },
      { direction: 'outbound', content: 'Nosso plano mensal custa R$ 199,00 e inclui suporte 24h.' },
      { direction: 'inbound', content: 'Perfeito, vou pensar e retorno.' },
      { direction: 'outbound', content: 'Fico à disposição! Qualquer dúvida é só chamar.' },
    ];

    for (let j = 0; j < messageTemplates.length; j++) {
      const msg = messageTemplates[j];
      await prisma.message.create({
        data: {
          id: uuidv4(),
          tenantId: tenant1Id,
          conversationId: conversation.id,
          direction: msg.direction as any,
          type: 'text',
          content: msg.content,
          status: 'delivered',
          createdAt: new Date(Date.now() - (messageTemplates.length - j) * 600000 - i * 3600000),
          deliveredAt: new Date(Date.now() - (messageTemplates.length - j) * 600000 - i * 3600000 + 1000),
        },
      });
    }
  }

  console.log('✅ Conversations and messages created for Tenant 1');

  // ============================================================================
  // 7. CONVERSATIONS AND MESSAGES (Tenant 2)
  // ============================================================================
  const contactsData2 = [
    { name: 'Amanda Silva', phone: '+5521991111111' },
    { name: 'Bruno Costa', phone: '+5521992222222' },
    { name: 'Carla Oliveira', phone: '+5521993333333' },
  ];

  for (let i = 0; i < contactsData2.length; i++) {
    const contact = contactsData2[i];
    const conversation = await prisma.conversation.create({
      data: {
        id: uuidv4(),
        tenantId: tenant2Id,
        channel: 'whatsapp',
        whatsappInstanceId: whatsappInstance3.id,
        contactPhone: contact.phone,
        contactName: contact.name,
        status: 'open',
        priority: 'normal',
        lastMessageAt: new Date(Date.now() - i * 7200000),
        tags: ['aluno'],
      },
    });

    await prisma.message.create({
      data: {
        id: uuidv4(),
        tenantId: tenant2Id,
        conversationId: conversation.id,
        direction: 'inbound',
        type: 'text',
        content: 'Oi, quero saber sobre os planos da academia!',
        status: 'delivered',
        createdAt: new Date(Date.now() - i * 7200000),
      },
    });

    await prisma.message.create({
      data: {
        id: uuidv4(),
        tenantId: tenant2Id,
        conversationId: conversation.id,
        direction: 'outbound',
        type: 'text',
        content: 'Olá! Temos planos a partir de R$ 89,90/mês. Quer agendar uma visita?',
        status: 'delivered',
        createdAt: new Date(Date.now() - i * 7200000 + 300000),
      },
    });
  }

  console.log('✅ Conversations and messages created for Tenant 2');

  // ============================================================================
  // 8. AUTOMATIONS
  // ============================================================================
  await prisma.automation.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      name: 'Boas-vindas Automático',
      description: 'Envia mensagem de boas-vindas para novos contatos',
      trigger: { type: 'new_contact', config: {} },
      actions: [
        {
          type: 'send_message',
          config: {
            message: 'Olá! Seja bem-vindo à Tech Solutions. Como posso ajudar?',
          },
        },
      ],
      status: 'active',
      createdById: tenant1Admin.id,
    },
  });

  await prisma.automation.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      name: 'Resposta Fora do Horário',
      description: 'Responde automaticamente fora do horário comercial',
      trigger: { type: 'message_received', config: { outsideBusinessHours: true } },
      conditions: {
        businessHours: {
          start: '08:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5],
        },
      },
      actions: [
        {
          type: 'send_message',
          config: {
            message: 'Obrigado pelo contato! Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Retornaremos em breve!',
          },
        },
      ],
      status: 'active',
      createdById: tenant1Admin.id,
    },
  });

  await prisma.automation.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      name: 'Lembrete de Treino',
      description: 'Envia lembrete de treino aos alunos',
      trigger: { type: 'scheduled', config: { schedule: '0 6 * * 1-5' } },
      actions: [
        {
          type: 'send_message',
          config: {
            message: '💪 Bom dia! Não esqueça do seu treino hoje. A academia está te esperando!',
          },
        },
      ],
      status: 'active',
      createdById: tenant2Admin.id,
    },
  });

  console.log('✅ Automations created');

  // ============================================================================
  // 9. CALENDAR EVENTS
  // ============================================================================
  const now = new Date();
  
  await prisma.calendarEvent.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      title: 'Reunião com Cliente XYZ',
      description: 'Apresentação de proposta comercial',
      startAt: new Date(now.getTime() + 24 * 3600000),
      endAt: new Date(now.getTime() + 25 * 3600000),
      location: 'Sala de Reuniões 1',
      allDay: false,
      color: '#4CAF50',
    },
  });

  await prisma.calendarEvent.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      title: 'Follow-up Leads',
      description: 'Ligar para leads da semana',
      startAt: new Date(now.getTime() + 48 * 3600000),
      endAt: new Date(now.getTime() + 49 * 3600000),
      allDay: false,
      color: '#2196F3',
    },
  });

  await prisma.calendarEvent.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      title: 'Aula Especial de Spinning',
      description: 'Aula aberta para novos alunos',
      startAt: new Date(now.getTime() + 72 * 3600000),
      endAt: new Date(now.getTime() + 73 * 3600000),
      allDay: false,
      color: '#FF5722',
    },
  });

  console.log('✅ Calendar events created');

  // ============================================================================
  // 10. SUPPORT TICKETS
  // ============================================================================
  const ticket1 = await prisma.ticket.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      ticketNumber: 'TKT-2026-0001',
      createdById: tenant1Admin.id,
      subject: 'Dúvida sobre integração com API',
      description: 'Gostaria de saber como integrar a API de mensagens com nosso sistema interno.',
      status: 'open',
      priority: 'medium',
      category: 'technical',
    },
  });

  await prisma.ticketMessage.create({
    data: {
      id: uuidv4(),
      ticketId: ticket1.id,
      senderId: tenant1Admin.id,
      content: 'Preciso de documentação detalhada sobre webhooks.',
      isInternal: false,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      ticketNumber: 'TKT-2026-0002',
      createdById: tenant2Admin.id,
      subject: 'Problema com QR Code',
      description: 'O QR Code do WhatsApp não está aparecendo na tela.',
      status: 'in_progress',
      priority: 'high',
      category: 'bug',
      assignedToId: superAdmin.id,
    },
  });

  await prisma.ticketMessage.create({
    data: {
      id: uuidv4(),
      ticketId: ticket2.id,
      senderId: superAdmin.id,
      content: 'Estamos verificando o problema. Pode tentar limpar o cache do navegador?',
      isInternal: false,
    },
  });

  console.log('✅ Support tickets created');

  // ============================================================================
  // 11. NOTIFICATIONS
  // ============================================================================
  await prisma.notification.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      userId: tenant1Admin.id,
      type: 'info',
      title: 'Bem-vindo ao CodeSolve!',
      message: 'Sua conta foi criada com sucesso. Explore todas as funcionalidades disponíveis.',
    },
  });

  await prisma.notification.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      userId: tenant1Admin.id,
      type: 'warning',
      title: 'Limite de mensagens',
      message: 'Você utilizou 80% do seu limite de mensagens este mês.',
    },
  });

  await prisma.notification.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      userId: tenant2Admin.id,
      type: 'success',
      title: 'WhatsApp conectado',
      message: 'Sua instância de WhatsApp foi conectada com sucesso!',
      readAt: new Date(),
    },
  });

  console.log('✅ Notifications created');

  // ============================================================================
  // 12. AUDIT LOGS
  // ============================================================================
  await prisma.auditLog.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      userId: tenant1Admin.id,
      action: 'user.login',
      entity: 'user',
      entityId: tenant1Admin.id,
      newValue: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0' },
      ipAddress: '192.168.1.100',
    },
  });

  await prisma.auditLog.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      userId: tenant1Admin.id,
      action: 'whatsapp.instance.create',
      entity: 'whatsapp_instance',
      entityId: whatsappInstance1.id,
      newValue: { name: 'Atendimento Principal' },
      ipAddress: '192.168.1.100',
    },
  });

  await prisma.auditLog.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      userId: tenant2Admin.id,
      action: 'automation.create',
      entity: 'automation',
      newValue: { name: 'Lembrete de Treino' },
      ipAddress: '192.168.1.200',
    },
  });

  console.log('✅ Audit logs created');

  // ============================================================================
  // 13. SUBSCRIPTIONS
  // ============================================================================
  await prisma.subscription.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      planId: professionalPlan!.id,
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date(now.getTime() - 15 * 24 * 3600000),
      currentPeriodEnd: new Date(now.getTime() + 15 * 24 * 3600000),
    },
  });

  await prisma.subscription.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      planId: starterPlan!.id,
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date(now.getTime() - 10 * 24 * 3600000),
      currentPeriodEnd: new Date(now.getTime() + 20 * 24 * 3600000),
    },
  });

  console.log('✅ Subscriptions created');

  // ============================================================================
  // 14. INVOICES
  // ============================================================================
  await prisma.invoice.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      invoiceNumber: 'INV-2026-0001',
      status: 'paid',
      subtotal: 19900,
      total: 19900,
      dueDate: new Date(now.getTime() - 5 * 24 * 3600000),
      paidAt: new Date(now.getTime() - 6 * 24 * 3600000),
      paymentMethod: 'pix',
      items: {
        create: [
          { description: 'Plano Professional - Janeiro/2026', unitPrice: 19900, total: 19900 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      invoiceNumber: 'INV-2026-0002',
      status: 'pending',
      subtotal: 19900,
      total: 19900,
      dueDate: new Date(now.getTime() + 10 * 24 * 3600000),
      items: {
        create: [
          { description: 'Plano Professional - Fevereiro/2026', unitPrice: 19900, total: 19900 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      invoiceNumber: 'INV-2026-0003',
      status: 'paid',
      subtotal: 9900,
      total: 9900,
      dueDate: new Date(now.getTime() - 3 * 24 * 3600000),
      paidAt: new Date(now.getTime() - 4 * 24 * 3600000),
      paymentMethod: 'credit_card',
      items: {
        create: [
          { description: 'Plano Starter - Janeiro/2026', unitPrice: 9900, total: 9900 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      id: uuidv4(),
      tenantId: tenant3Id,
      invoiceNumber: 'INV-2026-0004',
      status: 'pending',
      subtotal: 49900,
      total: 49900,
      dueDate: new Date(now.getTime() + 14 * 24 * 3600000),
      items: {
        create: [
          { description: 'Plano Enterprise - Após trial', unitPrice: 49900, total: 49900 },
        ],
      },
    },
  });

  console.log('✅ Invoices created');

  // ============================================================================
  // 15. USAGE RECORDS
  // ============================================================================
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  await prisma.usageRecord.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      resourceType: 'messages',
      usageCount: BigInt(3500),
      limitCount: BigInt(20000),
      period: currentMonth,
    },
  });

  await prisma.usageRecord.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      resourceType: 'ai_tokens',
      usageCount: BigInt(45000),
      limitCount: BigInt(200000),
      period: currentMonth,
    },
  });

  await prisma.usageRecord.create({
    data: {
      id: uuidv4(),
      tenantId: tenant1Id,
      resourceType: 'storage',
      usageCount: BigInt(1500000000),
      limitCount: BigInt(10737418240),
      period: currentMonth,
    },
  });

  await prisma.usageRecord.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      resourceType: 'messages',
      usageCount: BigInt(1200),
      limitCount: BigInt(5000),
      period: currentMonth,
    },
  });

  await prisma.usageRecord.create({
    data: {
      id: uuidv4(),
      tenantId: tenant2Id,
      resourceType: 'ai_tokens',
      usageCount: BigInt(15000),
      limitCount: BigInt(50000),
      period: currentMonth,
    },
  });

  console.log('✅ Usage records created');

  // Message templates model not in schema - skipping

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   - 4 Billing Plans (Free, Starter, Professional, Enterprise)');
  console.log('   - 4 Billing Modules');
  console.log('   - 1 SuperAdmin');
  console.log('   - 3 Tenants:');
  console.log('     • Tech Solutions (Professional) - 3 users');
  console.log('     • Fitness Pro (Starter) - 2 users');
  console.log('     • Clínica Saúde (Enterprise/Trial) - 1 user');
  console.log('   - 4 WhatsApp Instances');
  console.log('   - 8 Conversations with messages');
  console.log('   - 3 Automations');
  console.log('   - 3 Calendar Events');
  console.log('   - 2 Support Tickets with messages');
  console.log('   - 3 Notifications');
  console.log('   - 3 Audit Logs');
  console.log('   - 2 Subscriptions');
  console.log('   - 4 Invoices');
  console.log('   - 5 Usage Records');
  console.log('   - 3 Message Templates');
  console.log('\n📋 Test Users:');
  console.log('   ┌─────────────────────────────────────────────────────────────────┐');
  console.log('   │ SuperAdmin: admin@codesolve.com.br / Admin@123                  │');
  console.log('   ├─────────────────────────────────────────────────────────────────┤');
  console.log('   │ Tech Solutions:                                                 │');
  console.log('   │   Admin: admin@techsolutions.com.br / Tech@123                  │');
  console.log('   │   Operador: maria@techsolutions.com.br / Operador@123           │');
  console.log('   │   Operador: joao@techsolutions.com.br / Operador@123            │');
  console.log('   ├─────────────────────────────────────────────────────────────────┤');
  console.log('   │ Fitness Pro:                                                    │');
  console.log('   │   Admin: admin@fitnesspro.com.br / Fitness@123                  │');
  console.log('   │   Operador: atendimento@fitnesspro.com.br / Operador@123        │');
  console.log('   ├─────────────────────────────────────────────────────────────────┤');
  console.log('   │ Clínica Saúde (Trial):                                          │');
  console.log('   │   Admin: dr.fernanda@clinicasaude.com.br / Clinica@123          │');
  console.log('   └─────────────────────────────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
