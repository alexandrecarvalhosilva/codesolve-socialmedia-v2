import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requirePermission } from '../middleware/auth';
import { ROLE_PERMISSIONS } from '../types';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// TIPOS
// ============================================================================

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  tenantId: string | null;
  isSystem: boolean;
  usersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ROLES PRÉ-DEFINIDAS DO SISTEMA
// ============================================================================

const SYSTEM_ROLES: Omit<CustomRole, 'usersCount' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    description: 'Acesso total ao sistema, incluindo gestão de tenants e configurações globais',
    permissions: ROLE_PERMISSIONS.superadmin,
    tenantId: null,
    isSystem: true,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Gerenciamento completo do tenant, exceto configurações de sistema',
    permissions: ROLE_PERMISSIONS.admin,
    tenantId: null,
    isSystem: true,
  },
  {
    id: 'operador',
    name: 'Operador',
    description: 'Acesso operacional ao tenant com permissões de visualização e gerenciamento',
    permissions: ROLE_PERMISSIONS.operador,
    tenantId: null,
    isSystem: true,
  },
  {
    id: 'visualizador',
    name: 'Visualizador',
    description: 'Apenas visualização de dados, sem permissão de modificação',
    permissions: ROLE_PERMISSIONS.visualizador,
    tenantId: null,
    isSystem: true,
  },
];

// ============================================================================
// LISTAR ROLES
// ============================================================================

router.get('/', authenticate, requirePermission('roles:view'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Contar usuários por role
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
      where: user.role !== 'superadmin' ? { tenantId: user.tenantId } : undefined,
    });
    
    const countMap = userCounts.reduce((acc, item) => {
      acc[item.role] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    // Combinar roles do sistema com contagem de usuários
    const roles = SYSTEM_ROLES.map(role => ({
      ...role,
      usersCount: countMap[role.id] || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    // TODO: Buscar roles customizadas do banco quando implementado
    // const customRoles = await prisma.customRole.findMany({ where: { tenantId: user.tenantId } });
    
    res.json({
      success: true,
      data: {
        items: roles,
        total: roles.length,
      },
    });
  } catch (error) {
    console.error('Erro ao listar roles:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar roles' },
    });
  }
});

// ============================================================================
// OBTER ROLE POR ID
// ============================================================================

router.get('/:id', authenticate, requirePermission('roles:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    // Buscar role do sistema
    const systemRole = SYSTEM_ROLES.find(r => r.id === id);
    
    if (systemRole) {
      // Contar usuários com essa role
      const usersCount = await prisma.user.count({
        where: {
          role: id as any,
          ...(user.role !== 'superadmin' ? { tenantId: user.tenantId } : {}),
        },
      });
      
      return res.json({
        success: true,
        data: {
          ...systemRole,
          usersCount,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
    
    // TODO: Buscar role customizada do banco
    
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Role não encontrada' },
    });
  } catch (error) {
    console.error('Erro ao buscar role:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao buscar role' },
    });
  }
});

// ============================================================================
// CRIAR ROLE CUSTOMIZADA
// ============================================================================

router.post('/', authenticate, requirePermission('roles:create'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, description, permissions } = req.body;
    
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Nome e permissões são obrigatórios' },
      });
    }
    
    // Verificar se já existe role com esse nome
    const existingRole = SYSTEM_ROLES.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_NAME', message: 'Já existe uma role com esse nome' },
      });
    }
    
    // TODO: Salvar no banco quando tabela CustomRole for criada
    // Por enquanto, retornar a role criada em memória
    const newRole: CustomRole = {
      id: `custom_${Date.now()}`,
      name,
      description: description || '',
      permissions,
      tenantId: user.tenantId,
      isSystem: false,
      usersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    res.status(201).json({
      success: true,
      data: newRole,
    });
  } catch (error) {
    console.error('Erro ao criar role:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar role' },
    });
  }
});

// ============================================================================
// ATUALIZAR ROLE
// ============================================================================

router.put('/:id', authenticate, requirePermission('roles:edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    
    // Verificar se é role do sistema
    const systemRole = SYSTEM_ROLES.find(r => r.id === id);
    if (systemRole) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Roles do sistema não podem ser editadas' },
      });
    }
    
    // TODO: Atualizar role customizada no banco
    
    res.json({
      success: true,
      data: {
        id,
        name,
        description,
        permissions,
        isSystem: false,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar role' },
    });
  }
});

// ============================================================================
// DELETAR ROLE
// ============================================================================

router.delete('/:id', authenticate, requirePermission('roles:delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se é role do sistema
    const systemRole = SYSTEM_ROLES.find(r => r.id === id);
    if (systemRole) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Roles do sistema não podem ser deletadas' },
      });
    }
    
    // Verificar se há usuários usando essa role
    // TODO: Implementar quando tabela CustomRole existir
    
    res.json({
      success: true,
      data: { message: 'Role removida com sucesso' },
    });
  } catch (error) {
    console.error('Erro ao deletar role:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao deletar role' },
    });
  }
});

// ============================================================================
// LISTAR TODAS AS PERMISSÕES DISPONÍVEIS
// ============================================================================

router.get('/meta/permissions', authenticate, async (req: Request, res: Response) => {
  try {
    // Combinar todas as permissões únicas
    const allPermissions = new Set<string>();
    Object.values(ROLE_PERMISSIONS).forEach(perms => {
      perms.forEach(p => allPermissions.add(p));
    });
    
    // Agrupar por módulo
    const grouped: Record<string, string[]> = {};
    allPermissions.forEach(perm => {
      const [module] = perm.split(':');
      if (!grouped[module]) grouped[module] = [];
      grouped[module].push(perm);
    });
    
    res.json({
      success: true,
      data: {
        all: Array.from(allPermissions).sort(),
        grouped,
      },
    });
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar permissões' },
    });
  }
});

export default router;
