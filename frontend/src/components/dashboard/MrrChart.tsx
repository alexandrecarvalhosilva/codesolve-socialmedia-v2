import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { formatPrice } from '@/types/billing';
import { mockRevenueByMonth } from '@/data/billingMockData';

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
          <AreaChart data={mockRevenueByMonth}>
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
              tickFormatter={(value) => `${(value / 100000).toFixed(0)}k`}
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
