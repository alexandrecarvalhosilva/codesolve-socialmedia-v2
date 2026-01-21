# Análise de Gaps - Frontend vs Backend

## 1. ROLES E PERMISSÕES

### Status: ⚠️ PARCIALMENTE IMPLEMENTADO

**Backend:**
- ✅ Permissões definidas em `types/index.ts` (ROLE_PERMISSIONS)
- ✅ Middleware de autenticação verifica permissões
- ❌ **FALTA**: Endpoint CRUD para Roles customizadas

**Frontend:**
- ✅ Página Roles.tsx existe
- ✅ Sistema de permissões no moduleRegistry.ts
- ⚠️ Usa dados mock locais (não persiste no backend)

**Ação Necessária:**
- Criar `routes/roles.ts` no backend com CRUD de roles
- Criar hook `useRoles.ts` no frontend
- Integrar página Roles.tsx com backend

---

## 2. MÓDULOS

### Status: ⚠️ PARCIALMENTE IMPLEMENTADO

**Backend:**
- ❌ **FALTA**: Endpoint para gerenciar módulos por tenant
- ❌ **FALTA**: Tabela de módulos no banco

**Frontend:**
- ✅ ModulesContext.tsx funciona (localStorage)
- ✅ TenantModulesContext.tsx existe
- ⚠️ Persiste apenas no localStorage, não no backend

**Ação Necessária:**
- Criar tabela TenantModule no Prisma
- Criar `routes/modules.ts` no backend
- Criar hook `useModules.ts` para API

---

## 3. DASHBOARDS

### Status: ✅ IMPLEMENTADO

**Dashboards Verificados:**
- ✅ TenantDashboard - Integrado via useDashboard
- ✅ FinancialDashboard - Integrado via useBilling
- ✅ SupportDashboard - Integrado via useSupport
- ✅ AIOverview - Integrado via useAI

---

## 4. PÁGINAS A VERIFICAR

### Billing (SuperAdmin)
- [ ] AllInvoices.tsx
- [ ] AllSubscriptions.tsx
- [ ] ManageCoupons.tsx
- [ ] ManageModules.tsx
- [ ] ManagePlans.tsx
- [ ] FinancialDashboard.tsx

### Billing (Tenant)
- [ ] TenantBilling.tsx
- [ ] TenantBillingHistory.tsx
- [ ] TenantInvoices.tsx
- [ ] TenantModules.tsx
- [ ] TenantPayment.tsx
- [ ] TenantPlans.tsx

### Support
- [ ] SupportDashboard.tsx
- [ ] ManageSLAs.tsx
- [ ] TenantSupport.tsx

### AI
- [ ] AIOverview.tsx
- [ ] TenantAIConfig.tsx
- [ ] TenantAIDashboard.tsx

### Chat
- [ ] TenantChat.tsx
- [ ] TenantChatTab.tsx

### Outros
- [ ] Roles.tsx
- [ ] Usuarios.tsx
- [ ] Tenants.tsx
- [ ] Relatorios.tsx
- [ ] Logs.tsx
- [ ] Configuracoes.tsx

---

## 5. COMPONENTES A VERIFICAR

### Botões de Ação
- [ ] Criar/Editar/Excluir em cada página
- [ ] Exportar dados
- [ ] Filtros e buscas

### Listas/Tabelas
- [ ] Paginação
- [ ] Ordenação
- [ ] Filtros

---

## PRÓXIMOS PASSOS

1. Criar endpoint de Roles no backend
2. Criar endpoint de Modules no backend
3. Verificar cada página individualmente
4. Integrar páginas com hooks existentes
