import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { TenantAutomationsTab } from '@/components/tenant/TenantAutomationsTab';

export default function TenantAutomations() {
  return (
    <TenantLayout>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cs-text-primary">Automações</h1>
          <p className="text-cs-text-secondary">Gerencie suas automações e fluxos</p>
        </div>
        <TenantAutomationsTab />
      </div>
    </TenantLayout>
  );
}
