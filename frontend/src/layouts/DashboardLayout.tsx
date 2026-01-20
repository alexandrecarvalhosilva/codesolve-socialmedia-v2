import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebarContext();
  
  return (
    <div className="min-h-screen bg-cs-bg-primary">
      <Sidebar />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-sidebar'}`}>
        {children}
      </main>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
