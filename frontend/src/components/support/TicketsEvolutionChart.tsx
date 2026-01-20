import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for weekly ticket evolution
const generateWeeklyData = (weeks: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    
    const weekLabel = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`;
    
    data.push({
      week: weekLabel,
      opened: Math.floor(Math.random() * 20) + 10,
      resolved: Math.floor(Math.random() * 18) + 8,
      breached: Math.floor(Math.random() * 5),
    });
  }
  
  return data;
};

const periodOptions = [
  { value: '4', label: 'Últimas 4 semanas' },
  { value: '8', label: 'Últimas 8 semanas' },
  { value: '12', label: 'Últimas 12 semanas' },
];

export function TicketsEvolutionChart() {
  const [period, setPeriod] = useState('8');
  const data = generateWeeklyData(parseInt(period));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Evolução de Tickets
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44 bg-muted border-border h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="week" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    opened: 'Abertos',
                    resolved: 'Resolvidos',
                    breached: 'SLA Violado',
                  };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(label) => `Semana de ${label}`}
              />
              <Legend 
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    opened: 'Abertos',
                    resolved: 'Resolvidos',
                    breached: 'SLA Violado',
                  };
                  return <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}>{labels[value] || value}</span>;
                }}
              />
              <Bar 
                dataKey="opened" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="resolved" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="breached" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
