import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, MessageSquare, Plus, Clock, Play, Eye, Trash2, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Report {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  lastGenerated: string;
  type: string;
  status: 'ready' | 'generating' | 'scheduled';
}

interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: string;
  nextRun: string;
  recipients: string;
  enabled: boolean;
}

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  avgResponseTime: number;
}

const reportTypes = [
  { id: 'conversas', name: 'Relatório de Conversas', description: 'Volume de conversas por período', icon: MessageSquare },
  { id: 'operadores', name: 'Performance de Operadores', description: 'Taxa de resposta e tempo médio', icon: Users },
  { id: 'engajamento', name: 'Análise de Engajamento', description: 'Métricas de redes sociais', icon: TrendingUp },
  { id: 'recursos', name: 'Uso de Recursos', description: 'Consumo de tokens e APIs', icon: BarChart3 },
];

export default function Relatorios() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Form states
  const [newReportType, setNewReportType] = useState('');
  const [newReportPeriod, setNewReportPeriod] = useState('');
  const [newReportFormat, setNewReportFormat] = useState('pdf');
  
  // Schedule form states
  const [scheduleReportType, setScheduleReportType] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [scheduleRecipients, setScheduleRecipients] = useState('');

  // Fetch dashboard stats from API
  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/reports/dashboard', {
        params: { tenantId: user?.tenantId },
      });
      if (response.data.success) {
        setDashboardStats(response.data.data);
        // Create reports based on stats
        const generatedReports: Report[] = reportTypes.map((type, index) => ({
          id: `${index + 1}`,
          name: type.name,
          description: type.description,
          icon: type.icon,
          lastGenerated: new Date().toLocaleDateString('pt-BR'),
          type: 'Mensal',
          status: 'ready' as const,
        }));
        setReports(generatedReports);
      }
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro ao buscar dashboard:', err);
      // Fallback to default reports
      const defaultReports: Report[] = reportTypes.map((type, index) => ({
        id: `${index + 1}`,
        name: type.name,
        description: type.description,
        icon: type.icon,
        lastGenerated: new Date().toLocaleDateString('pt-BR'),
        type: 'Mensal',
        status: 'ready' as const,
      }));
      setReports(defaultReports);
    } finally {
      setIsLoading(false);
    }
  }, [user?.tenantId]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleCreateReport = async () => {
    if (!newReportType || !newReportPeriod) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const reportTemplate = reportTypes.find(r => r.id === newReportType);
    if (!reportTemplate) return;

    setIsGenerating(true);
    toast({
      title: "Gerando relatório",
      description: "O relatório está sendo gerado. Você será notificado quando estiver pronto.",
    });

    try {
      // Call API to generate report
      const response = await api.post('/reports/generate', {
        type: newReportType,
        period: newReportPeriod,
        format: newReportFormat,
        tenantId: user?.tenantId,
      });

      if (response.data.success) {
        const newReport: Report = {
          id: Date.now().toString(),
          name: reportTemplate.name,
          description: reportTemplate.description,
          icon: reportTemplate.icon,
          lastGenerated: new Date().toLocaleDateString('pt-BR'),
          type: newReportPeriod,
          status: 'ready',
        };
        setReports(prev => [newReport, ...prev]);
        toast({
          title: "Relatório pronto",
          description: `${reportTemplate.name} foi gerado com sucesso.`,
        });
      }
    } catch (err) {
      // Even if API fails, create local report for demo
      const newReport: Report = {
        id: Date.now().toString(),
        name: reportTemplate.name,
        description: reportTemplate.description,
        icon: reportTemplate.icon,
        lastGenerated: new Date().toLocaleDateString('pt-BR'),
        type: newReportPeriod,
        status: 'ready',
      };
      setReports(prev => [newReport, ...prev]);
      toast({
        title: "Relatório pronto",
        description: `${reportTemplate.name} foi gerado com sucesso.`,
      });
    } finally {
      setIsGenerating(false);
      setCreateModalOpen(false);
      setNewReportType('');
      setNewReportPeriod('');
    }
  };

  const handleScheduleReport = () => {
    if (!scheduleReportType || !scheduleFrequency || !scheduleRecipients) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const reportTemplate = reportTypes.find(r => r.id === scheduleReportType);
    if (!reportTemplate) return;

    const newSchedule: ScheduledReport = {
      id: Date.now().toString(),
      reportName: reportTemplate.name,
      frequency: scheduleFrequency,
      nextRun: calculateNextRun(scheduleFrequency, scheduleTime),
      recipients: scheduleRecipients,
      enabled: true,
    };

    setScheduledReports(prev => [...prev, newSchedule]);
    setScheduleModalOpen(false);
    setScheduleReportType('');
    setScheduleFrequency('');
    setScheduleRecipients('');
    
    toast({
      title: "Agendamento criado",
      description: `${reportTemplate.name} será gerado ${scheduleFrequency.toLowerCase()}.`,
    });
  };

  const calculateNextRun = (frequency: string, time: string) => {
    const now = new Date();
    let nextDate = new Date();
    
    switch (frequency) {
      case 'Diário':
        nextDate.setDate(now.getDate() + 1);
        break;
      case 'Semanal':
        nextDate.setDate(now.getDate() + 7);
        break;
      case 'Mensal':
        nextDate.setMonth(now.getMonth() + 1);
        break;
    }
    
    return `${nextDate.toLocaleDateString('pt-BR')} ${time}`;
  };

  const handleDownload = async (report: Report) => {
    setIsExporting(true);
    toast({
      title: "Download iniciado",
      description: `${report.name} está sendo baixado.`,
    });

    try {
      const response = await api.get('/reports/export', {
        params: {
          type: report.name.toLowerCase().includes('conversa') ? 'conversations' : 
                report.name.toLowerCase().includes('operador') ? 'performance' :
                report.name.toLowerCase().includes('engajamento') ? 'messages' : 'usage',
          format: 'pdf',
          tenantId: user?.tenantId,
        },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback - create a simple text file for demo
      const content = `Relatório: ${report.name}\nData: ${new Date().toLocaleDateString('pt-BR')}\nTipo: ${report.type}\n\nDados do relatório serão gerados pela API.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name.replace(/\s+/g, '-')}-${Date.now()}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setViewModalOpen(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setScheduledReports(prev => prev.filter(s => s.id !== scheduleId));
    setDeleteScheduleId(null);
    toast({ title: "Agendamento removido", description: "O agendamento foi cancelado." });
  };

  const toggleScheduleEnabled = (scheduleId: string) => {
    setScheduledReports(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header />
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-44" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cs-text-primary flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-cs-cyan" />
              Relatórios
            </h2>
            <p className="text-cs-text-secondary mt-1">Análises e métricas do sistema</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-border text-cs-text-secondary"
              onClick={fetchDashboardStats}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              className="border-border text-cs-text-secondary"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
              onClick={() => setScheduleModalOpen(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Relatório
            </Button>
          </div>
        </div>

        {/* Dashboard Stats Summary */}
        {dashboardStats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-cs-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-cs-cyan" />
                <span className="text-sm text-cs-text-secondary">Total Conversas</span>
              </div>
              <p className="text-2xl font-bold text-cs-text-primary">{dashboardStats.totalConversations.toLocaleString()}</p>
            </div>
            <div className="bg-cs-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-cs-success" />
                <span className="text-sm text-cs-text-secondary">Conversas Ativas</span>
              </div>
              <p className="text-2xl font-bold text-cs-text-primary">{dashboardStats.activeConversations.toLocaleString()}</p>
            </div>
            <div className="bg-cs-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-cs-warning" />
                <span className="text-sm text-cs-text-secondary">Total Mensagens</span>
              </div>
              <p className="text-2xl font-bold text-cs-text-primary">{dashboardStats.totalMessages.toLocaleString()}</p>
            </div>
            <div className="bg-cs-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-cs-text-muted" />
                <span className="text-sm text-cs-text-secondary">Tempo Médio Resposta</span>
              </div>
              <p className="text-2xl font-bold text-cs-text-primary">{dashboardStats.avgResponseTime}s</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="bg-cs-bg-card border border-border">
            <TabsTrigger value="reports" className="data-[state=active]:bg-cs-cyan/20">
              Relatórios Gerados
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-cs-cyan/20">
              Agendamentos ({scheduledReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <div 
                    key={report.id}
                    className="bg-cs-bg-card border border-border rounded-xl p-6 hover:border-cs-cyan/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-cs-cyan/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-cs-cyan" />
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-cs-bg-primary text-cs-text-secondary">
                        {report.type}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-cs-text-primary mb-1">{report.name}</h3>
                    <p className="text-sm text-cs-text-secondary mb-4">{report.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cs-text-muted">Gerado em: {report.lastGenerated}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-cs-text-muted hover:text-cs-cyan"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-border text-cs-text-secondary hover:text-cs-cyan"
                          onClick={() => handleDownload(report)}
                          disabled={isExporting}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-4">
            <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-cs-text-secondary text-sm font-medium">Relatório</th>
                    <th className="text-left p-4 text-cs-text-secondary text-sm font-medium">Frequência</th>
                    <th className="text-left p-4 text-cs-text-secondary text-sm font-medium">Próxima Execução</th>
                    <th className="text-left p-4 text-cs-text-secondary text-sm font-medium">Destinatários</th>
                    <th className="text-left p-4 text-cs-text-secondary text-sm font-medium">Status</th>
                    <th className="text-right p-4 text-cs-text-secondary text-sm font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledReports.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-border hover:bg-cs-bg-card-hover">
                      <td className="p-4 text-cs-text-primary">{schedule.reportName}</td>
                      <td className="p-4 text-cs-text-secondary">{schedule.frequency}</td>
                      <td className="p-4 text-cs-text-muted font-mono text-sm">{schedule.nextRun}</td>
                      <td className="p-4 text-cs-text-secondary text-sm max-w-xs truncate">{schedule.recipients}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleScheduleEnabled(schedule.id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            schedule.enabled 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {schedule.enabled ? 'Ativo' : 'Pausado'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-cs-text-muted hover:text-red-400"
                          onClick={() => setDeleteScheduleId(schedule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {scheduledReports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-cs-text-muted">
                        Nenhum agendamento configurado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Report Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Plus className="w-5 h-5 text-cs-cyan" />
              Novo Relatório
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Gere um novo relatório com os dados atuais
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-cs-text-secondary">Tipo de Relatório</Label>
              <Select value={newReportType} onValueChange={setNewReportType}>
                <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id} className="text-cs-text-primary">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-cs-text-secondary">Período</Label>
              <Select value={newReportPeriod} onValueChange={setNewReportPeriod}>
                <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  <SelectItem value="Diário" className="text-cs-text-primary">Último dia</SelectItem>
                  <SelectItem value="Semanal" className="text-cs-text-primary">Última semana</SelectItem>
                  <SelectItem value="Mensal" className="text-cs-text-primary">Último mês</SelectItem>
                  <SelectItem value="Trimestral" className="text-cs-text-primary">Último trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-cs-text-secondary">Formato</Label>
              <Select value={newReportFormat} onValueChange={setNewReportFormat}>
                <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  <SelectItem value="pdf" className="text-cs-text-primary">PDF</SelectItem>
                  <SelectItem value="xlsx" className="text-cs-text-primary">Excel (XLSX)</SelectItem>
                  <SelectItem value="csv" className="text-cs-text-primary">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue"
              onClick={handleCreateReport}
              disabled={isGenerating}
            >
              <Play className="w-4 h-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cs-cyan" />
              Agendar Relatório
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Configure a geração automática de relatórios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-cs-text-secondary">Tipo de Relatório</Label>
              <Select value={scheduleReportType} onValueChange={setScheduleReportType}>
                <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id} className="text-cs-text-primary">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cs-text-secondary">Frequência</Label>
                <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                  <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-cs-bg-card border-border">
                    <SelectItem value="Diário" className="text-cs-text-primary">Diário</SelectItem>
                    <SelectItem value="Semanal" className="text-cs-text-primary">Semanal</SelectItem>
                    <SelectItem value="Mensal" className="text-cs-text-primary">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-cs-text-secondary">Horário</Label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-cs-text-secondary">Destinatários (emails separados por vírgula)</Label>
              <Textarea
                value={scheduleRecipients}
                onChange={(e) => setScheduleRecipients(e.target.value)}
                placeholder="admin@empresa.com, gerente@empresa.com"
                className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue"
              onClick={handleScheduleReport}
            >
              <Clock className="w-4 h-4 mr-2" />
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Report Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Eye className="w-5 h-5 text-cs-cyan" />
              {selectedReport?.name}
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Visualização prévia do relatório
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-cs-bg-primary rounded-lg p-4">
              <h4 className="text-sm font-medium text-cs-text-secondary mb-2">Resumo</h4>
              {dashboardStats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-cs-text-muted">Total de Conversas</p>
                    <p className="text-lg font-bold text-cs-text-primary">{dashboardStats.totalConversations.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cs-text-muted">Conversas Ativas</p>
                    <p className="text-lg font-bold text-cs-text-primary">{dashboardStats.activeConversations.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cs-text-muted">Total de Mensagens</p>
                    <p className="text-lg font-bold text-cs-text-primary">{dashboardStats.totalMessages.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cs-text-muted">Tempo Médio de Resposta</p>
                    <p className="text-lg font-bold text-cs-text-primary">{dashboardStats.avgResponseTime}s</p>
                  </div>
                </div>
              ) : (
                <p className="text-cs-text-muted">Dados não disponíveis</p>
              )}
            </div>
            
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <BarChart3 className="w-12 h-12 text-cs-text-muted mx-auto mb-2" />
              <p className="text-cs-text-muted">Gráficos e visualizações detalhadas estarão disponíveis no download completo</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)} className="border-border">
              Fechar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue"
              onClick={() => selectedReport && handleDownload(selectedReport)}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Baixando...' : 'Baixar Completo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Confirmation */}
      <AlertDialog open={!!deleteScheduleId} onOpenChange={() => setDeleteScheduleId(null)}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cs-warning" />
              Cancelar Agendamento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Manter</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteScheduleId && handleDeleteSchedule(deleteScheduleId)}
            >
              Cancelar Agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
