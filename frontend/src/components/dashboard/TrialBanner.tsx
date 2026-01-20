import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Zap, X } from 'lucide-react';
import { useState } from 'react';

export function TrialBanner() {
  const { user, getTrialDaysRemaining } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  
  // Only show for trial users
  if (!user?.trialEndsAt || dismissed) return null;
  
  const daysRemaining = getTrialDaysRemaining();
  
  // Don't show if trial expired (they should see an expiration modal instead)
  if (daysRemaining < 0) return null;
  
  const isUrgent = daysRemaining <= 3;
  const isExpiringSoon = daysRemaining <= 7;
  
  return (
    <div className={`
      relative overflow-hidden rounded-xl border p-4 mb-6
      ${isUrgent 
        ? 'bg-gradient-to-r from-destructive/20 to-destructive/10 border-destructive/50' 
        : isExpiringSoon 
          ? 'bg-gradient-to-r from-warning/20 to-warning/10 border-warning/50'
          : 'bg-gradient-to-r from-primary/20 to-accent/10 border-primary/30'
      }
    `}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 blur-xl" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-xl
            ${isUrgent 
              ? 'bg-destructive/20 text-destructive' 
              : isExpiringSoon 
                ? 'bg-warning/20 text-warning'
                : 'bg-primary/20 text-primary'
            }
          `}>
            <Clock className="h-6 w-6" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${isUrgent 
                  ? 'bg-destructive/30 text-destructive' 
                  : 'bg-primary/30 text-primary'
                }
              `}>
                TRIAL
              </span>
              <h3 className="font-semibold text-foreground">
                {daysRemaining === 0 
                  ? 'Seu trial expira hoje!' 
                  : daysRemaining === 1 
                    ? 'Seu trial expira amanhã!' 
                    : `${daysRemaining} dias restantes no trial`
                }
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isUrgent 
                ? 'Faça o upgrade agora para não perder acesso às suas automações.'
                : 'Aproveite ao máximo sua experiência. Faça o upgrade quando estiver pronto.'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button asChild className="btn-gradient flex-1 sm:flex-initial">
            <Link to="/tenant/billing/plans">
              <Zap className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Link>
          </Button>
          
          {!isUrgent && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
