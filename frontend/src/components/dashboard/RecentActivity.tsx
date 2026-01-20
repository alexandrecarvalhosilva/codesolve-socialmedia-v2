import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface Activity {
  id: string;
  type: 'post' | 'sync' | 'alert' | 'action';
  message: string;
  time: string;
}

const activities: Activity[] = [
  { id: '1', type: 'post', message: 'Post agendado para @techcompany publicado com sucesso', time: 'Há 5 min' },
  { id: '2', type: 'sync', message: 'Sincronização automática de 3 contas concluída', time: 'Há 12 min' },
  { id: '3', type: 'alert', message: 'Conta @devbrasil precisa reconectar', time: 'Há 1 hora' },
  { id: '4', type: 'action', message: 'Novo tenant "Fashion Store" criado', time: 'Há 2 horas' },
  { id: '5', type: 'post', message: 'Campanha "Black Friday" iniciada em 5 contas', time: 'Há 3 horas' },
];

const activityIcons = {
  post: { icon: CheckCircle, color: 'text-cs-success', bg: 'bg-cs-success/10' },
  sync: { icon: Zap, color: 'text-cs-cyan', bg: 'bg-cs-cyan/10' },
  alert: { icon: AlertCircle, color: 'text-cs-warning', bg: 'bg-cs-warning/10' },
  action: { icon: Clock, color: 'text-cs-blue', bg: 'bg-cs-blue/10' },
};

export function RecentActivity() {
  const navigate = useNavigate();

  return (
    <div className="cs-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-cs-xl font-semibold text-cs-text-primary">Atividade Recente</h3>
        <button 
          className="text-sm text-cs-cyan hover:text-cs-cyan/80 transition-colors"
          onClick={() => navigate('/logs')}
        >
          Ver todas
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const { icon: Icon, color, bg } = activityIcons[activity.type];
          
          return (
            <div key={activity.id} className="flex items-start gap-3 group">
              <div className={`p-2 rounded-lg ${bg} transition-colors`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cs-text-primary leading-relaxed">
                  {activity.message}
                </p>
                <p className="text-xs text-cs-text-secondary mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
