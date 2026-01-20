import { useState, useEffect } from 'react';
import { Building2, Users, MessageSquare, AlertTriangle, Activity, Ticket } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { MrrChart } from '@/components/dashboard/MrrChart';
import { TopTenantsTable } from '@/components/dashboard/TopTenantsTable';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { BillingSummaryCard } from '@/components/billing/BillingSummaryCard';
import { SupportSummaryCard } from '@/components/dashboard/SupportSummaryCard';
import { AIConsumptionCard } from '@/components/dashboard/AIConsumptionCard';
import { MetricAlertsCard } from '@/components/dashboard/MetricAlertsCard';
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/skeleton-loader';
import { Skeleton } from '@/components/ui/skeleton';

const metrics = [
  { label: 'Total Tenants', value: 12, icon: Building2, trend: { value: 8.5, isPositive: true } },
  { label: 'Usuários Ativos', value: 48, icon: Users, trend: { value: 12.3, isPositive: true } },
  { label: 'Conversas Hoje', value: 1250, icon: MessageSquare, trend: { value: 15.2, isPositive: true } },
  { label: 'Tenants com Alerta', value: 3, icon: AlertTriangle, subtitle: 'Precisam atenção' },
  { label: 'Uptime Sistema', value: '99.9%', icon: Activity, trend: { value: 0.1, isPositive: true } },
  { label: 'Tickets Abertos', value: 7, icon: Ticket, trend: { value: 2, isPositive: false } },
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header />
        <div className="p-8 space-y-6 animate-fade-in">
          {/* Metrics Skeleton */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>
          </section>

          {/* Chart + Cards Skeleton */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Table + Activity Skeleton */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TableSkeleton rows={5} columns={4} />
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6">
        {/* Metrics Grid */}
        <section className="opacity-0 animate-enter" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((metric, index) => (
              <div 
                key={metric.label}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <MetricCard
                  label={metric.label}
                  value={metric.value}
                  icon={metric.icon}
                  trend={metric.trend}
                  subtitle={metric.subtitle}
                />
              </div>
            ))}
          </div>
        </section>

        {/* MRR Chart + Financial Summary + Support */}
        <section 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-0 animate-enter"
          style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
        >
          <div className="lg:col-span-2">
            <MrrChart />
          </div>
          <div className="space-y-6">
            <MetricAlertsCard />
            <BillingSummaryCard variant="superadmin" />
          </div>
        </section>

        {/* AI + Support */}
        <section 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-0 animate-enter"
          style={{ animationDelay: '225ms', animationFillMode: 'forwards' }}
        >
          <AIConsumptionCard />
          <SupportSummaryCard />
        </section>

        {/* Top Tenants + Activity */}
        <section 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-0 animate-enter"
          style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
        >
          <div className="lg:col-span-2">
            <TopTenantsTable />
          </div>
          <RecentActivity />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Index;
