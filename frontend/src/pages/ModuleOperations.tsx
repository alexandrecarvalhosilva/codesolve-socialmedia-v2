import { useState } from 'react';
import { 
  Bell, 
  BarChart3, 
  FileText, 
  Ticket, 
  ShieldCheck, 
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Activity,
  Settings
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  getAllModules, 
  getModuleOperationalSummary,
  ModuleConfig,
  ModuleNotificationTrigger,
  ModuleMetric,
  ModuleLogAction,
  ModuleTicketTrigger,
  ModuleAuditAction
} from '@/config/moduleRegistry';

const ModuleOperations = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const modules = getAllModules();
  
  const selectedModuleConfig = selectedModule 
    ? modules.find(m => m.id === selectedModule) 
    : null;
  
  const summary = selectedModule 
    ? getModuleOperationalSummary(selectedModule) 
    : null;

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações Operacionais</h1>
            <p className="text-muted-foreground">Visualize notificações, métricas, logs e auditoria de cada módulo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de Módulos */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Módulos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-2 space-y-1">
                  {modules.map(module => {
                    const moduleSummary = getModuleOperationalSummary(module.id);
                    const hasOperationalConfig = moduleSummary && (
                      moduleSummary.hasNotifications || 
                      moduleSummary.hasMonitoring || 
                      moduleSummary.hasLogging || 
                      moduleSummary.hasTicketing || 
                      moduleSummary.hasAudit
                    );
                    
                    return (
                      <button
                        key={module.id}
                        onClick={() => setSelectedModule(module.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors",
                          selectedModule === module.id 
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <module.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{module.name}</span>
                        </div>
                        {hasOperationalConfig && (
                          <div className="flex items-center gap-1">
                            {moduleSummary?.hasNotifications && <Bell className="h-3 w-3 opacity-50" />}
                            {moduleSummary?.hasMonitoring && <BarChart3 className="h-3 w-3 opacity-50" />}
                            {moduleSummary?.hasLogging && <FileText className="h-3 w-3 opacity-50" />}
                            {moduleSummary?.hasAudit && <ShieldCheck className="h-3 w-3 opacity-50" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Detalhes do Módulo */}
          <div className="lg:col-span-3">
            {selectedModuleConfig ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <selectedModuleConfig.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{selectedModuleConfig.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedModuleConfig.description}</p>
                      </div>
                    </div>
                    <Badge variant={selectedModuleConfig.enabled ? 'default' : 'secondary'}>
                      {selectedModuleConfig.enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  {/* Resumo */}
                  {summary && (
                    <div className="flex gap-4 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{summary.notificationCount} notificações</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{summary.metricCount} métricas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{summary.logActionCount} ações de log</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{summary.ticketTriggerCount} tickets auto</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{summary.auditActionCount} auditoria</span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="notifications" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="notifications" className="gap-1">
                        <Bell className="h-3.5 w-3.5" />
                        Notificações
                      </TabsTrigger>
                      <TabsTrigger value="monitoring" className="gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Métricas
                      </TabsTrigger>
                      <TabsTrigger value="logging" className="gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Logs
                      </TabsTrigger>
                      <TabsTrigger value="ticketing" className="gap-1">
                        <Ticket className="h-3.5 w-3.5" />
                        Tickets
                      </TabsTrigger>
                      <TabsTrigger value="audit" className="gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Auditoria
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="notifications" className="mt-4">
                      <NotificationsTab module={selectedModuleConfig} />
                    </TabsContent>
                    
                    <TabsContent value="monitoring" className="mt-4">
                      <MonitoringTab module={selectedModuleConfig} />
                    </TabsContent>
                    
                    <TabsContent value="logging" className="mt-4">
                      <LoggingTab module={selectedModuleConfig} />
                    </TabsContent>
                    
                    <TabsContent value="ticketing" className="mt-4">
                      <TicketingTab module={selectedModuleConfig} />
                    </TabsContent>
                    
                    <TabsContent value="audit" className="mt-4">
                      <AuditTab module={selectedModuleConfig} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecione um módulo para ver suas configurações operacionais</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Tabs Components

function NotificationsTab({ module }: { module: ModuleConfig }) {
  const triggers = module.notifications?.triggers || [];
  
  if (triggers.length === 0) {
    return (
      <EmptyState 
        icon={Bell} 
        message="Nenhuma notificação configurada para este módulo" 
      />
    );
  }
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {triggers.map(trigger => (
          <NotificationItem key={trigger.id} trigger={trigger} />
        ))}
      </div>
    </ScrollArea>
  );
}

function NotificationItem({ trigger }: { trigger: ModuleNotificationTrigger }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    urgent: 'bg-destructive/10 text-destructive border-destructive/30'
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg p-3">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium text-sm">{trigger.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={priorityColors[trigger.priority]}>
                {trigger.priority}
              </Badge>
              {trigger.defaultEnabled && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3 pt-3 border-t space-y-2">
          <p className="text-sm text-muted-foreground">{trigger.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Evento:</span>
              <code className="ml-2 px-2 py-0.5 bg-muted rounded text-xs">{trigger.event}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Canais:</span>
              <div className="flex gap-1 mt-1">
                {trigger.channels.map(channel => (
                  <Badge key={channel} variant="secondary" className="text-xs">{channel}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-2 rounded text-sm">
            <span className="text-muted-foreground">Template:</span>
            <p className="mt-1 font-mono text-xs">{trigger.template}</p>
          </div>
          
          {trigger.cooldown && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Cooldown: {trigger.cooldown}s entre notificações
            </p>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function MonitoringTab({ module }: { module: ModuleConfig }) {
  const metrics = module.monitoring?.metrics || [];
  const widgets = module.monitoring?.dashboardWidgets || [];
  
  if (metrics.length === 0) {
    return (
      <EmptyState 
        icon={BarChart3} 
        message="Nenhuma métrica configurada para este módulo" 
      />
    );
  }
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {/* Widgets */}
        {widgets.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Widgets de Dashboard ({widgets.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {widgets.map(widget => (
                <Badge key={widget.id} variant="outline" className="gap-1">
                  {widget.name}
                  <span className="text-xs opacity-50">({widget.type})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metrics.map(metric => (
            <MetricItem key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function MetricItem({ metric }: { metric: ModuleMetric }) {
  const typeLabels = {
    counter: 'Contador',
    gauge: 'Gauge',
    percentage: 'Percentual',
    currency: 'Moeda',
    duration: 'Duração'
  };
  
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-sm">{metric.name}</p>
          <p className="text-xs text-muted-foreground">{metric.description}</p>
        </div>
        <Badge variant="secondary" className="text-xs">{typeLabels[metric.type]}</Badge>
      </div>
      
      {metric.thresholds && (
        <div className="mt-2 pt-2 border-t flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            Warning: {metric.thresholds.warning}{metric.unit}
          </span>
          <span className="flex items-center gap-1 text-destructive">
            <AlertTriangle className="h-3 w-3" />
            Critical: {metric.thresholds.critical}{metric.unit}
          </span>
          <span className="text-muted-foreground">
            ({metric.thresholds.direction === 'above' ? '↑' : '↓'})
          </span>
        </div>
      )}
    </div>
  );
}

function LoggingTab({ module }: { module: ModuleConfig }) {
  const actions = module.logging?.actions || [];
  
  if (actions.length === 0) {
    return (
      <EmptyState 
        icon={FileText} 
        message="Nenhuma ação de log configurada para este módulo" 
      />
    );
  }
  
  const severityColors = {
    debug: 'bg-gray-500/10 text-gray-600',
    info: 'bg-blue-500/10 text-blue-600',
    warning: 'bg-yellow-500/10 text-yellow-600',
    error: 'bg-orange-500/10 text-orange-600',
    critical: 'bg-destructive/10 text-destructive'
  };
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {actions.map(action => (
          <div key={action.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={severityColors[action.severity]}>{action.severity}</Badge>
                <span className="font-medium text-sm">{action.action}</span>
              </div>
              <span className="text-xs text-muted-foreground">{action.retentionDays} dias</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {action.dataToCapture.map(field => (
                <code key={field} className="px-1.5 py-0.5 bg-muted rounded text-xs">{field}</code>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function TicketingTab({ module }: { module: ModuleConfig }) {
  const triggers = module.ticketing?.autoCreate || [];
  
  if (triggers.length === 0) {
    return (
      <EmptyState 
        icon={Ticket} 
        message="Nenhum trigger de ticket automático configurado" 
      />
    );
  }
  
  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-600',
    medium: 'bg-yellow-500/10 text-yellow-600',
    high: 'bg-orange-500/10 text-orange-600',
    urgent: 'bg-destructive/10 text-destructive'
  };
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {triggers.map(trigger => (
          <div key={trigger.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{trigger.name}</span>
              <Badge className={priorityColors[trigger.priority]}>{trigger.priority}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{trigger.description}</p>
            
            <div className="flex items-center gap-4 mt-2 pt-2 border-t text-xs">
              <span className="text-muted-foreground">
                Categoria: <strong>{trigger.category}</strong>
              </span>
              {trigger.escalationMinutes && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Escalar em {trigger.escalationMinutes} min
                </span>
              )}
              {trigger.autoAssign && (
                <Badge variant="outline" className="text-xs">Auto-atribuir</Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {trigger.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function AuditTab({ module }: { module: ModuleConfig }) {
  const actions = module.audit?.actions || [];
  
  if (actions.length === 0) {
    return (
      <EmptyState 
        icon={ShieldCheck} 
        message="Nenhuma ação de auditoria configurada para este módulo" 
      />
    );
  }
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {actions.map(action => (
          <div key={action.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {action.alertOnAction && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                <span className="font-medium text-sm">{action.action}</span>
              </div>
              <div className="flex items-center gap-2">
                {action.requiresReason && (
                  <Badge variant="outline" className="text-xs">Requer justificativa</Badge>
                )}
                <span className="text-xs text-muted-foreground">{action.retentionYears} anos</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            
            {action.complianceTags && action.complianceTags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {action.complianceTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground mr-1">Dados capturados:</span>
              {action.captureData.map(field => (
                <code key={field} className="px-1.5 py-0.5 bg-muted rounded text-xs">{field}</code>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default ModuleOperations;
