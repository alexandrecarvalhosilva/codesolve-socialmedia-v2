import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { TenantGeneralConfigTab } from '@/components/tenant/TenantGeneralConfigTab';

export default function TenantConfig() {
  return (
    <TenantLayout>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cs-text-primary">Configurações</h1>
          <p className="text-cs-text-secondary">Gerencie as configurações do seu tenant</p>
        </div>
        <TenantGeneralConfigTab />
      </div>
    </TenantLayout>
  );
}
