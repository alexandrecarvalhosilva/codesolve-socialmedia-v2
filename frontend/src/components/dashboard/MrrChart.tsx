import { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/types/billing';
import { useMrrData } from '@/hooks/useBilling';

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cs-bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-cs-text-primary font-semibold mb-1">{label}</p>
        <p className="text-sm text-cs-cyan">
          MRR: {formatPrice(payload[0].value as number)}
        </p>
      </div>
    );
  }
  return null;
};

export function MrrChart() {
  const { data, isLoading, fetchMrrData } = useMrrData();

  useEffect(() => {
    fetchMrrData();
  }, []);

  if (isLoading) {
    return (
      <div className="cs-card p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  // Fallback data if no data from backend
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 0 },
    { month: 'Fev', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Abr', revenue: 0 },
    { month: 'Mai', revenue: 0 },
    { month: 'Jun', revenue: 0 },
    { month: 'Jul', revenue: 0 },
    { month: 'Ago', revenue: 0 },
    { month: 'Set', revenue: 0 },
    { month: 'Out', revenue: 0 },
    { month: 'Nov', revenue: 0 },
    { month: 'Dez', revenue: 0 },
  ];

  return (
    <div className="cs-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-cs-xl font-semibold text-cs-text-primary">Evolução do MRR</h3>
          <p className="text-sm text-cs-text-secondary mt-1">Receita recorrente mensal (12 meses)</p>
        </div>
      </div>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--cs-cyan))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--cs-cyan))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--cs-text-muted))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--cs-text-muted))', fontSize: 12 }}
              tickFormatter={(value) => value > 0 ? `${(value / 100000).toFixed(0)}k` : '0'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--cs-cyan))" 
              strokeWidth={2}
              fill="url(#mrrGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
