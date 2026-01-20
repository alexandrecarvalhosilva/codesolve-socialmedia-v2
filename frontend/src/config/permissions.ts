// Re-exportar do novo registry para manter compatibilidade
export { 
  MODULE_REGISTRY as MODULE_CONFIGS,
  getAllModules,
  getModuleById,
  getActiveModules,
  getModulesByCategory,
  getModuleCategories,
  getAllPermissions,
  getAllPermissionIds,
  type ModuleConfig,
  type ModulePermission as Permission,
  type ModuleFeature,
  type ModuleRoute,
  type ModuleNavItem,
} from './moduleRegistry';

import { MODULE_REGISTRY, type ModuleConfig } from './moduleRegistry';

// ============================================
// TEMPLATES DE ROLES PRÉ-DEFINIDAS
// ============================================

export type RoleTemplateId = 'superadmin' | 'admin' | 'operador' | 'visualizador';

export interface RoleTemplate {
  id: RoleTemplateId;
  name: string;
  description: string;
  permissions: string[];
}

// Função que gera templates baseados nos módulos ativos
export const getRoleTemplates = (enabledModuleIds?: string[]): RoleTemplate[] => {
  // Se não passar módulos específicos, usa todos
  const modules = enabledModuleIds 
    ? MODULE_REGISTRY.filter(m => enabledModuleIds.includes(m.id))
    : MODULE_REGISTRY.filter(m => m.enabled);
  
  const allPerms = modules.flatMap(m => m.permissions.map(p => p.id));
  
  // SuperAdmin tem todas as permissões
  const superadminPerms = allPerms;
  
  // Admin tem permissões de tenant, exceto sistema
  const adminPerms = allPerms.filter(p => 
    !p.startsWith('system:') && 
    !p.startsWith('tenants:') && 
    !p.startsWith('finance:') && 
    !p.startsWith('support:view_all') &&
    !p.startsWith('support:assign') &&
    !p.startsWith('support:manage_slas') &&
    !p.startsWith('support:respond') &&
    !p.startsWith('support:escalate')
  );
  
  // Operador tem permissões de view e manage
  const operadorPerms = allPerms.filter(p => {
    const [, action] = p.split(':');
    return ['view', 'manage', 'view_consumption'].includes(action);
  });
  
  // Visualizador só tem permissões de view
  const visualizadorPerms = allPerms.filter(p => {
    const [, action] = p.split(':');
    return action === 'view' || action === 'view_consumption';
  });

  return [
    {
      id: 'superadmin',
      name: 'Super Admin',
      description: 'Acesso total ao sistema, incluindo gestão de tenants e configurações globais',
      permissions: superadminPerms,
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Gerenciamento completo do tenant, exceto configurações de sistema',
      permissions: adminPerms,
    },
    {
      id: 'operador',
      name: 'Operador',
      description: 'Acesso operacional ao tenant com permissões de visualização e gerenciamento',
      permissions: operadorPerms,
    },
    {
      id: 'visualizador',
      name: 'Visualizador',
      description: 'Apenas visualização de dados, sem permissão de modificação',
      permissions: visualizadorPerms,
    },
  ];
};
