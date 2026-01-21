import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireTenantMembership } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/contacts - List contacts
// ============================================================================
router.get('/', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, search, tags, source, listId, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      tenantId: user.tenantId,
      deletedAt: null,
    };

    // Search by name, phone, email
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search) } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { company: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    // Filter by tags
    if (tags) {
      const tagList = String(tags).split(',');
      where.tags = { hasSome: tagList };
    }

    // Filter by source
    if (source) {
      where.source = source;
    }

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Filter by list membership
    if (listId) {
      where.contactLists = {
        some: { listId: String(listId) },
      };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contactLists: {
            include: {
              list: {
                select: { id: true, name: true, color: true },
              },
            },
          },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: contacts.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          avatar: c.avatar,
          company: c.company,
          position: c.position,
          notes: c.notes,
          tags: c.tags,
          customFields: c.customFields,
          source: c.source,
          isActive: c.isActive,
          isBlocked: c.isBlocked,
          lastContactAt: c.lastContactAt?.toISOString() || null,
          lists: c.contactLists.map(cl => cl.list),
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + contacts.length < total,
      },
    });
  } catch (error) {
    console.error('List contacts error:', error);
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
// GET /api/contacts/:id - Get contact details
// ============================================================================
router.get('/:id', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        deletedAt: null,
      },
      include: {
        contactLists: {
          include: {
            list: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: 'Contato não encontrado',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        avatar: contact.avatar,
        company: contact.company,
        position: contact.position,
        notes: contact.notes,
        tags: contact.tags,
        customFields: contact.customFields,
        source: contact.source,
        isActive: contact.isActive,
        isBlocked: contact.isBlocked,
        lastContactAt: contact.lastContactAt?.toISOString() || null,
        lists: contact.contactLists.map(cl => cl.list),
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get contact error:', error);
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
// POST /api/contacts - Create contact
// ============================================================================
router.post('/', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, phone, email, avatar, company, position, notes, tags, customFields, listIds } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nome é obrigatório',
        },
      });
    }

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Telefone ou email é obrigatório',
        },
      });
    }

    // Check for duplicates
    if (phone) {
      const existingByPhone = await prisma.contact.findFirst({
        where: { tenantId: user.tenantId!, phone, deletedAt: null },
      });
      if (existingByPhone) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_PHONE',
            message: 'Já existe um contato com este telefone',
          },
        });
      }
    }

    if (email) {
      const existingByEmail = await prisma.contact.findFirst({
        where: { tenantId: user.tenantId!, email, deletedAt: null },
      });
      if (existingByEmail) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Já existe um contato com este email',
          },
        });
      }
    }

    const contactId = uuidv4();

    const contact = await prisma.contact.create({
      data: {
        id: contactId,
        tenantId: user.tenantId!,
        name,
        phone: phone || null,
        email: email || null,
        avatar: avatar || null,
        company: company || null,
        position: position || null,
        notes: notes || null,
        tags: tags || [],
        customFields: customFields || null,
        source: 'manual',
      },
    });

    // Add to lists if specified
    if (listIds && Array.isArray(listIds) && listIds.length > 0) {
      await prisma.contactListMember.createMany({
        data: listIds.map((listId: string) => ({
          id: uuidv4(),
          contactId,
          listId,
        })),
        skipDuplicates: true,
      });

      // Update list member counts
      await Promise.all(
        listIds.map((listId: string) =>
          prisma.contactList.update({
            where: { id: listId },
            data: { memberCount: { increment: 1 } },
          })
        )
      );
    }

    return res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Create contact error:', error);
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
// PUT /api/contacts/:id - Update contact
// ============================================================================
router.put('/:id', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { name, phone, email, avatar, company, position, notes, tags, customFields, isActive, isBlocked } = req.body;

    const contact = await prisma.contact.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: 'Contato não encontrado',
        },
      });
    }

    // Check for duplicates if phone/email changed
    if (phone && phone !== contact.phone) {
      const existingByPhone = await prisma.contact.findFirst({
        where: { tenantId: user.tenantId!, phone, id: { not: id }, deletedAt: null },
      });
      if (existingByPhone) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_PHONE',
            message: 'Já existe um contato com este telefone',
          },
        });
      }
    }

    if (email && email !== contact.email) {
      const existingByEmail = await prisma.contact.findFirst({
        where: { tenantId: user.tenantId!, email, id: { not: id }, deletedAt: null },
      });
      if (existingByEmail) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Já existe um contato com este email',
          },
        });
      }
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        name: name ?? contact.name,
        phone: phone ?? contact.phone,
        email: email ?? contact.email,
        avatar: avatar ?? contact.avatar,
        company: company ?? contact.company,
        position: position ?? contact.position,
        notes: notes ?? contact.notes,
        tags: tags ?? contact.tags,
        customFields: customFields ?? contact.customFields,
        isActive: isActive ?? contact.isActive,
        isBlocked: isBlocked ?? contact.isBlocked,
      },
    });

    return res.json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    console.error('Update contact error:', error);
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
// DELETE /api/contacts/:id - Delete contact (soft delete)
// ============================================================================
router.delete('/:id', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: 'Contato não encontrado',
        },
      });
    }

    // Soft delete
    await prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Remove from all lists and update counts
    const memberships = await prisma.contactListMember.findMany({
      where: { contactId: id },
    });

    if (memberships.length > 0) {
      await prisma.contactListMember.deleteMany({
        where: { contactId: id },
      });

      // Update list counts
      const listIds = [...new Set(memberships.map(m => m.listId))];
      await Promise.all(
        listIds.map(listId =>
          prisma.contactList.update({
            where: { id: listId },
            data: { memberCount: { decrement: 1 } },
          })
        )
      );
    }

    return res.json({
      success: true,
      data: { message: 'Contato removido com sucesso' },
    });
  } catch (error) {
    console.error('Delete contact error:', error);
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
// POST /api/contacts/:id/lists - Add contact to lists
// ============================================================================
router.post('/:id/lists', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { listIds } = req.body;

    if (!listIds || !Array.isArray(listIds) || listIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Lista de IDs é obrigatória',
        },
      });
    }

    const contact = await prisma.contact.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: 'Contato não encontrado',
        },
      });
    }

    // Get existing memberships
    const existingMemberships = await prisma.contactListMember.findMany({
      where: { contactId: id, listId: { in: listIds } },
    });
    const existingListIds = existingMemberships.map(m => m.listId);
    const newListIds = listIds.filter((lid: string) => !existingListIds.includes(lid));

    if (newListIds.length > 0) {
      await prisma.contactListMember.createMany({
        data: newListIds.map((listId: string) => ({
          id: uuidv4(),
          contactId: id,
          listId,
        })),
      });

      // Update list counts
      await Promise.all(
        newListIds.map((listId: string) =>
          prisma.contactList.update({
            where: { id: listId },
            data: { memberCount: { increment: 1 } },
          })
        )
      );
    }

    return res.json({
      success: true,
      data: { message: `Contato adicionado a ${newListIds.length} lista(s)` },
    });
  } catch (error) {
    console.error('Add contact to lists error:', error);
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
// DELETE /api/contacts/:id/lists/:listId - Remove contact from list
// ============================================================================
router.delete('/:id/lists/:listId', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id, listId } = req.params;

    const contact = await prisma.contact.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: 'Contato não encontrado',
        },
      });
    }

    const membership = await prisma.contactListMember.findFirst({
      where: { contactId: id, listId },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_IN_LIST',
          message: 'Contato não está nesta lista',
        },
      });
    }

    await prisma.contactListMember.delete({
      where: { id: membership.id },
    });

    // Update list count
    await prisma.contactList.update({
      where: { id: listId },
      data: { memberCount: { decrement: 1 } },
    });

    return res.json({
      success: true,
      data: { message: 'Contato removido da lista' },
    });
  } catch (error) {
    console.error('Remove contact from list error:', error);
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
// POST /api/contacts/import - Import contacts from CSV/JSON
// ============================================================================
router.post('/import', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { contacts, listId, skipDuplicates = true } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Lista de contatos é obrigatória',
        },
      });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const c of contacts) {
      try {
        if (!c.name || (!c.phone && !c.email)) {
          results.errors.push(`Contato inválido: ${JSON.stringify(c)}`);
          continue;
        }

        // Check for duplicates
        if (c.phone) {
          const existing = await prisma.contact.findFirst({
            where: { tenantId: user.tenantId!, phone: c.phone, deletedAt: null },
          });
          if (existing) {
            if (skipDuplicates) {
              results.skipped++;
              continue;
            }
          }
        }

        if (c.email) {
          const existing = await prisma.contact.findFirst({
            where: { tenantId: user.tenantId!, email: c.email, deletedAt: null },
          });
          if (existing) {
            if (skipDuplicates) {
              results.skipped++;
              continue;
            }
          }
        }

        const contactId = uuidv4();
        await prisma.contact.create({
          data: {
            id: contactId,
            tenantId: user.tenantId!,
            name: c.name,
            phone: c.phone || null,
            email: c.email || null,
            company: c.company || null,
            position: c.position || null,
            notes: c.notes || null,
            tags: c.tags || [],
            source: 'import',
          },
        });

        // Add to list if specified
        if (listId) {
          await prisma.contactListMember.create({
            data: {
              id: uuidv4(),
              contactId,
              listId,
            },
          });
        }

        results.imported++;
      } catch (err) {
        results.errors.push(`Erro ao importar ${c.name}: ${err}`);
      }
    }

    // Update list count if specified
    if (listId && results.imported > 0) {
      await prisma.contactList.update({
        where: { id: listId },
        data: { memberCount: { increment: results.imported } },
      });
    }

    return res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Import contacts error:', error);
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
// GET /api/contacts/lists - List contact lists
// ============================================================================
router.get('/lists', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      tenantId: user.tenantId,
      deletedAt: null,
    };

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    const [lists, total] = await Promise.all([
      prisma.contactList.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactList.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: lists.map(l => ({
          id: l.id,
          name: l.name,
          description: l.description,
          color: l.color,
          isDynamic: l.isDynamic,
          dynamicFilters: l.dynamicFilters,
          memberCount: l.memberCount,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + lists.length < total,
      },
    });
  } catch (error) {
    console.error('List contact lists error:', error);
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
// POST /api/contacts/lists - Create contact list
// ============================================================================
router.post('/lists', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, description, color, isDynamic, dynamicFilters } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nome é obrigatório',
        },
      });
    }

    // Check for duplicate name
    const existing = await prisma.contactList.findFirst({
      where: { tenantId: user.tenantId!, name, deletedAt: null },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_NAME',
          message: 'Já existe uma lista com este nome',
        },
      });
    }

    const list = await prisma.contactList.create({
      data: {
        id: uuidv4(),
        tenantId: user.tenantId!,
        name,
        description: description || null,
        color: color || null,
        isDynamic: isDynamic || false,
        dynamicFilters: dynamicFilters || null,
      },
    });

    return res.status(201).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error('Create contact list error:', error);
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
// PUT /api/contacts/lists/:id - Update contact list
// ============================================================================
router.put('/lists/:id', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { name, description, color, isDynamic, dynamicFilters } = req.body;

    const list = await prisma.contactList.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LIST_NOT_FOUND',
          message: 'Lista não encontrada',
        },
      });
    }

    // Check for duplicate name if changed
    if (name && name !== list.name) {
      const existing = await prisma.contactList.findFirst({
        where: { tenantId: user.tenantId!, name, id: { not: id }, deletedAt: null },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_NAME',
            message: 'Já existe uma lista com este nome',
          },
        });
      }
    }

    const updatedList = await prisma.contactList.update({
      where: { id },
      data: {
        name: name ?? list.name,
        description: description ?? list.description,
        color: color ?? list.color,
        isDynamic: isDynamic ?? list.isDynamic,
        dynamicFilters: dynamicFilters ?? list.dynamicFilters,
      },
    });

    return res.json({
      success: true,
      data: updatedList,
    });
  } catch (error) {
    console.error('Update contact list error:', error);
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
// DELETE /api/contacts/lists/:id - Delete contact list
// ============================================================================
router.delete('/lists/:id', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const list = await prisma.contactList.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LIST_NOT_FOUND',
          message: 'Lista não encontrada',
        },
      });
    }

    // Remove all memberships
    await prisma.contactListMember.deleteMany({
      where: { listId: id },
    });

    // Soft delete the list
    await prisma.contactList.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return res.json({
      success: true,
      data: { message: 'Lista removida com sucesso' },
    });
  } catch (error) {
    console.error('Delete contact list error:', error);
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
// GET /api/contacts/lists/:id/members - Get list members
// ============================================================================
router.get('/lists/:id/members', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const list = await prisma.contactList.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LIST_NOT_FOUND',
          message: 'Lista não encontrada',
        },
      });
    }

    const [members, total] = await Promise.all([
      prisma.contactListMember.findMany({
        where: { listId: id },
        skip,
        take: Number(limit),
        orderBy: { addedAt: 'desc' },
        include: {
          contact: true,
        },
      }),
      prisma.contactListMember.count({ where: { listId: id } }),
    ]);

    return res.json({
      success: true,
      data: {
        list: {
          id: list.id,
          name: list.name,
          memberCount: list.memberCount,
        },
        items: members.map(m => ({
          id: m.contact.id,
          name: m.contact.name,
          phone: m.contact.phone,
          email: m.contact.email,
          avatar: m.contact.avatar,
          addedAt: m.addedAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + members.length < total,
      },
    });
  } catch (error) {
    console.error('Get list members error:', error);
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
