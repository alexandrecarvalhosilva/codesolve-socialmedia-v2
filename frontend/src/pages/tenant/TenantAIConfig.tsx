import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { TenantAIConfigTab } from '@/components/tenant/TenantAIConfigTab';

export default function TenantAIConfig() {
  return (
    <TenantLayout>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cs-text-primary">Configurações da IA</h1>
          <p className="text-cs-text-secondary">Gerencie templates, prompts e comportamento da IA humanizada</p>
        </div>
        <TenantAIConfigTab />
      </div>
    </TenantLayout>
  );
}
