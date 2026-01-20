import { Building2, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusPill } from './StatusPill';
import { formatPrice } from '@/types/billing';

interface TopTenant {
  id: string;
  name: string;
  slug: string;
  mrr: number;
  users: number;
  status: 'active' | 'warning' | 'overdue';
  growth: number;
}

const topTenants: TopTenant[] = [
  { id: '1', name: 'Tech Corp', slug: 'techcorp', mrr: 49700, users: 15, status: 'active', growth: 12 },
  { id: '2', name: 'Marketing Pro', slug: 'marketingpro', mrr: 29700, users: 8, status: 'active', growth: 8 },
  { id: '3', name: 'Fashion Store', slug: 'fashionstore', mrr: 19700, users: 5, status: 'warning', growth: -2 },
  { id: '4', name: 'Dev Brasil', slug: 'devbrasil', mrr: 19700, users: 6, status: 'overdue', growth: 0 },
  { id: '5', name: 'Startup Hub', slug: 'startuphub', mrr: 9700, users: 3, status: 'active', growth: 25 },
];

const tenantsWithAlerts = [
  { id: '3', name: 'Fashion Store', issue: 'Uso de instâncias em 100%', severity: 'warning' as const },
  { id: '4', name: 'Dev Brasil', issue: 'Fatura vencida há 5 dias', severity: 'error' as const },
  { id: '6', name: 'Mega Shop', issue: 'WhatsApp desconectado', severity: 'warning' as const },
];

const statusConfig = {
  active: { type: 'success' as const, label: 'Ativo' },
  warning: { type: 'warning' as const, label: 'Atenção' },
  overdue: { type: 'error' as const, label: 'Inadimplente' },
};

export function TopTenantsTable() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top Tenants by Revenue */}
      <div className="lg:col-span-2 cs-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cs-cyan" />
            <div>
              <h3 className="font-semibold text-cs-text-primary">Top Tenants</h3>
              <p className="text-xs text-cs-text-muted">Por receita mensal</p>
            </div>
          </div>
          <Link to="/tenants">
            <Button variant="ghost" size="sm" className="text-cs-cyan hover:text-cs-cyan/80">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-cs-bg-primary/30">
                <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider text-cs-text-muted">
                  Tenant
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider text-cs-text-muted">
                  MRR
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider text-cs-text-muted">
                  Usuários
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider text-cs-text-muted">
                  Status
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider text-cs-text-muted">
                  Crescimento
                </th>
              </tr>
            </thead>
            <tbody>
              {topTenants.map((tenant, index) => {
                const statusInfo = statusConfig[tenant.status];
                
                return (
                  <tr 
                    key={tenant.id}
                    className={`border-b border-border/50 hover:bg-cs-bg-card-hover transition-colors cursor-pointer`}
                  >
                    <td className="py-3 px-5">
                      <Link to={`/tenants/${tenant.id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cs-cyan/10 flex items-center justify-center">
                          <span className="text-cs-cyan font-semibold text-sm">
                            {tenant.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-cs-text-primary">{tenant.name}</p>
                          <p className="text-xs text-cs-text-muted">/{tenant.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-cs-text-primary font-medium">
                      {formatPrice(tenant.mrr)}
                    </td>
                    <td className="py-3 px-5 text-cs-text-secondary">
                      {tenant.users}
                    </td>
                    <td className="py-3 px-5">
                      <StatusPill status={statusInfo.type} label={statusInfo.label} />
                    </td>
                    <td className="py-3 px-5">
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        tenant.growth > 0 ? 'text-cs-success' : tenant.growth < 0 ? 'text-cs-error' : 'text-cs-text-muted'
                      }`}>
                        {tenant.growth > 0 && <TrendingUp className="w-3 h-3" />}
                        {tenant.growth > 0 ? '+' : ''}{tenant.growth}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenants with Alerts */}
      <div className="cs-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-cs-warning" />
          <div>
            <h3 className="font-semibold text-cs-text-primary">Tenants com Alertas</h3>
            <p className="text-xs text-cs-text-muted">{tenantsWithAlerts.length} precisam de atenção</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {tenantsWithAlerts.map((tenant) => (
            <Link 
              key={tenant.id} 
              to={`/tenants/${tenant.id}`}
              className="block p-3 rounded-lg bg-cs-bg-primary/50 hover:bg-cs-bg-primary transition-colors border-l-2 border-l-transparent hover:border-l-cs-cyan"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-cs-text-primary text-sm">{tenant.name}</p>
                  <p className="text-xs text-cs-text-muted mt-1">{tenant.issue}</p>
                </div>
                <span className={`w-2 h-2 rounded-full mt-1 ${
                  tenant.severity === 'error' ? 'bg-cs-error' : 'bg-cs-warning'
                }`} />
              </div>
            </Link>
          ))}
        </div>

        {tenantsWithAlerts.length === 0 && (
          <div className="text-center py-6">
            <p className="text-cs-text-muted text-sm">Nenhum alerta ativo</p>
          </div>
        )}
      </div>
    </div>
  );
}
