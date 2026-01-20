import { Instagram, Facebook, Twitter, Linkedin, MoreHorizontal } from 'lucide-react';
import { StatusPill } from './StatusPill';

interface SocialAccount {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  username: string;
  tenant: string;
  followers: string;
  status: 'active' | 'disconnected' | 'pending';
  lastSync: string;
}

const accounts: SocialAccount[] = [
  { id: '1', platform: 'instagram', username: '@techcompany', tenant: 'Tech Corp', followers: '125K', status: 'active', lastSync: 'Há 5 min' },
  { id: '2', platform: 'facebook', username: 'Marketing Pro', tenant: 'Marketing Pro', followers: '89K', status: 'active', lastSync: 'Há 12 min' },
  { id: '3', platform: 'twitter', username: '@devbrasil', tenant: 'Dev Brasil', followers: '45K', status: 'disconnected', lastSync: 'Há 2 dias' },
  { id: '4', platform: 'linkedin', username: 'Startup Hub', tenant: 'Startup Hub', followers: '32K', status: 'pending', lastSync: 'Nunca' },
  { id: '5', platform: 'instagram', username: '@fashionstore', tenant: 'Fashion Store', followers: '210K', status: 'active', lastSync: 'Há 3 min' },
];

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
};

const platformColors = {
  instagram: 'text-pink-500',
  facebook: 'text-blue-500',
  twitter: 'text-sky-400',
  linkedin: 'text-blue-600',
};

const statusMap = {
  active: { type: 'success' as const, label: 'Ativo' },
  disconnected: { type: 'error' as const, label: 'Desconectado' },
  pending: { type: 'warning' as const, label: 'Pendente' },
};

export function SocialAccountsTable() {
  return (
    <div className="cs-card overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-cs-xl font-semibold text-cs-text-primary">Contas Conectadas</h3>
          <p className="text-sm text-cs-text-secondary mt-1">Gerencie as contas de redes sociais</p>
        </div>
        <button className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold">
          + Nova Conta
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-cs-text-secondary">
                Conta
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-cs-text-secondary">
                Tenant
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-cs-text-secondary">
                Seguidores
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-cs-text-secondary">
                Status
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-cs-text-secondary">
                Última Sync
              </th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, index) => {
              const PlatformIcon = platformIcons[account.platform];
              const statusInfo = statusMap[account.status];
              
              return (
                <tr 
                  key={account.id}
                  className={`border-b border-border/50 hover:bg-cs-bg-card-hover transition-colors ${
                    index % 2 === 1 ? 'bg-cs-bg-primary/30' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cs-bg-input">
                        <PlatformIcon className={`w-5 h-5 ${platformColors[account.platform]}`} />
                      </div>
                      <span className="font-medium text-cs-text-primary">{account.username}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-cs-text-secondary">
                    {account.tenant}
                  </td>
                  <td className="py-4 px-6 text-cs-text-primary font-medium">
                    {account.followers}
                  </td>
                  <td className="py-4 px-6">
                    <StatusPill status={statusInfo.type} label={statusInfo.label} />
                  </td>
                  <td className="py-4 px-6 text-cs-text-secondary text-sm">
                    {account.lastSync}
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 rounded-lg hover:bg-cs-bg-input transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-cs-text-secondary" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
