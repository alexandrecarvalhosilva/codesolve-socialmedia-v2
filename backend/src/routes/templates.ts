import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireSuperAdmin, requireTenantMembership } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Note: This uses a simplified in-memory storage for templates
// In production, create a MessageTemplate table in Prisma schema

interface Template {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  language: string;
  isActive: boolean;
  usageCount: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

// Temporary in-memory storage (replace with database in production)
const templates: Map<string, Template> = new Map();

// ============================================================================
// GET /api/templates - List templates
// ============================================================================
router.get('/', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, search, category, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Filter templates for this tenant
    let tenantTemplates = Array.from(templates.values())
      .filter(t => t.tenantId === user.tenantId);

    // Apply filters
    if (search) {
      const searchLower = String(search).toLowerCase();
      tenantTemplates = tenantTemplates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      tenantTemplates = tenantTemplates.filter(t => t.category === category);
    }

    if (isActive !== undefined) {
      tenantTemplates = tenantTemplates.filter(t => t.isActive === (isActive === 'true'));
    }

    // Sort by most used
    tenantTemplates.sort((a, b) => b.usageCount - a.usageCount);

    const total = tenantTemplates.length;
    const items = tenantTemplates.slice(skip, skip + Number(limit));

    return res.json({
      success: true,
      data: {
        items: items.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          content: t.content,
          variables: t.variables,
          language: t.language,
          isActive: t.isActive,
          usageCount: t.usageCount,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + items.length < total,
      },
    });
  } catch (error) {
    console.error('List templates error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// GET /api/templates/:id - Get template details
// ============================================================================
router.get('/:id', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const template = templates.get(id);

    if (!template || template.tenantId !== user.tenantId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template não encontrado',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        category: template.category,
        content: template.content,
        variables: template.variables,
        language: template.language,
        isActive: template.isActive,
        usageCount: template.usageCount,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get template error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// POST /api/templates - Create template
// ============================================================================
router.post('/', authenticate, requirePermission('templates:create'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, category, content, variables, language = 'pt-BR' } = req.body;

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nome e conteúdo são obrigatórios',
        },
      });
    }

    // Extract variables from content (format: {{variable_name}})
    const extractedVariables = content.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/\{\{|\}\}/g, '')) || [];
    const finalVariables = variables || extractedVariables;

    const templateId = uuidv4();
    const template: Template = {
      id: templateId,
      tenantId: user.tenantId!,
      name,
      category: category || 'general',
      content,
      variables: finalVariables,
      language,
      isActive: true,
      usageCount: 0,
      createdById: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    templates.set(templateId, template);

    return res.status(201).json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        category: template.category,
        content: template.content,
        variables: template.variables,
        language: template.language,
        isActive: template.isActive,
        createdAt: template.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create template error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// PUT /api/templates/:id - Update template
// ============================================================================
router.put('/:id', authenticate, requirePermission('templates:edit'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { name, category, content, variables, language, isActive } = req.body;

    const template = templates.get(id);

    if (!template || template.tenantId !== user.tenantId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template não encontrado',
        },
      });
    }

    // Update fields
    if (name !== undefined) template.name = name;
    if (category !== undefined) template.category = category;
    if (content !== undefined) {
      template.content = content;
      // Re-extract variables if content changed
      const extractedVariables = content.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/\{\{|\}\}/g, '')) || [];
      template.variables = variables || extractedVariables;
    } else if (variables !== undefined) {
      template.variables = variables;
    }
    if (language !== undefined) template.language = language;
    if (isActive !== undefined) template.isActive = isActive;
    template.updatedAt = new Date();

    templates.set(id, template);

    return res.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        category: template.category,
        content: template.content,
        variables: template.variables,
        language: template.language,
        isActive: template.isActive,
        updatedAt: template.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update template error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// DELETE /api/templates/:id - Delete template
// ============================================================================
router.delete('/:id', authenticate, requirePermission('templates:delete'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const template = templates.get(id);

    if (!template || template.tenantId !== user.tenantId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template não encontrado',
        },
      });
    }

    templates.delete(id);

    return res.json({
      success: true,
      data: { message: 'Template removido com sucesso' },
    });
  } catch (error) {
    console.error('Delete template error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// POST /api/templates/:id/use - Use template (increment usage count)
// ============================================================================
router.post('/:id/use', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { variables: variableValues } = req.body;

    const template = templates.get(id);

    if (!template || template.tenantId !== user.tenantId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template não encontrado',
        },
      });
    }

    if (!template.isActive) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TEMPLATE_INACTIVE',
          message: 'Template está inativo',
        },
      });
    }

    // Replace variables in content
    let renderedContent = template.content;
    if (variableValues && typeof variableValues === 'object') {
      for (const [key, value] of Object.entries(variableValues)) {
        renderedContent = renderedContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      }
    }

    // Increment usage count
    template.usageCount++;
    templates.set(id, template);

    return res.json({
      success: true,
      data: {
        templateId: template.id,
        templateName: template.name,
        renderedContent,
        usageCount: template.usageCount,
      },
    });
  } catch (error) {
    console.error('Use template error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// GET /api/templates/categories - List template categories
// ============================================================================
router.get('/meta/categories', authenticate, async (req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'general', name: 'Geral', description: 'Templates gerais' },
      { id: 'greeting', name: 'Saudação', description: 'Mensagens de boas-vindas' },
      { id: 'support', name: 'Suporte', description: 'Respostas de suporte' },
      { id: 'sales', name: 'Vendas', description: 'Mensagens de vendas' },
      { id: 'followup', name: 'Follow-up', description: 'Mensagens de acompanhamento' },
      { id: 'notification', name: 'Notificação', description: 'Avisos e notificações' },
      { id: 'confirmation', name: 'Confirmação', description: 'Confirmações de ações' },
      { id: 'reminder', name: 'Lembrete', description: 'Lembretes e alertas' },
    ];

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('List categories error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// POST /api/templates/preview - Preview template with variables
// ============================================================================
router.post('/preview', authenticate, async (req: Request, res: Response) => {
  try {
    const { content, variables } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Conteúdo é obrigatório',
        },
      });
    }

    // Extract variables from content
    const extractedVariables = content.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/\{\{|\}\}/g, '')) || [];

    // Replace variables if provided
    let renderedContent = content;
    if (variables && typeof variables === 'object') {
      for (const [key, value] of Object.entries(variables)) {
        renderedContent = renderedContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      }
    }

    return res.json({
      success: true,
      data: {
        originalContent: content,
        renderedContent,
        variables: extractedVariables,
        missingVariables: extractedVariables.filter(v => !variables || !(v in variables)),
      },
    });
  } catch (error) {
    console.error('Preview template error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

export default router;
