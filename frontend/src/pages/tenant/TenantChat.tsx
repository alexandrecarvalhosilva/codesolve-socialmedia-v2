import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { TenantChatTab } from '@/components/tenant/TenantChatTab';

export default function TenantChat() {
  return (
    <TenantLayout>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cs-text-primary">Chat</h1>
          <p className="text-cs-text-secondary">Gerencie suas conversas</p>
        </div>
        <TenantChatTab />
      </div>
    </TenantLayout>
  );
}
