import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { TenantCalendarTab } from '@/components/tenant/TenantCalendarTab';

export default function TenantCalendar() {
  return (
    <TenantLayout>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cs-text-primary">Calendário</h1>
          <p className="text-cs-text-secondary">Gerencie seus eventos e agendamentos</p>
        </div>
        <TenantCalendarTab />
      </div>
    </TenantLayout>
  );
}
