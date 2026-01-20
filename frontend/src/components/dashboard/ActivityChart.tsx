import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';

const data = [
  { name: 'Seg', posts: 24, engajamento: 180 },
  { name: 'Ter', posts: 18, engajamento: 145 },
  { name: 'Qua', posts: 32, engajamento: 290 },
  { name: 'Qui', posts: 28, engajamento: 210 },
  { name: 'Sex', posts: 36, engajamento: 320 },
  { name: 'Sáb', posts: 12, engajamento: 95 },
  { name: 'Dom', posts: 8, engajamento: 60 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cs-bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-cs-text-primary font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name === 'posts' ? 'Posts' : 'Engajamento'}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ActivityChart() {
  return (
    <div className="cs-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-cs-xl font-semibold text-cs-text-primary">Atividade Semanal</h3>
          <p className="text-sm text-cs-text-secondary mt-1">Posts e engajamento nos últimos 7 dias</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cs-cyan" />
            <span className="text-xs text-cs-text-secondary">Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cs-blue" />
            <span className="text-xs text-cs-text-secondary">Engajamento</span>
          </div>
        </div>
      </div>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.05)' }} />
            <defs>
              <linearGradient id="gradientCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--cs-cyan))" />
                <stop offset="100%" stopColor="hsl(var(--cs-blue))" />
              </linearGradient>
            </defs>
            <Bar 
              dataKey="posts" 
              fill="url(#gradientCyan)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar 
              dataKey="engajamento" 
              fill="hsl(var(--cs-blue))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
