import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus, Download, FileText, Calendar, CreditCard } from 'lucide-react';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { StatusBadge } from '@/components/billing/StatusBadge';
import { mockInvoices } from '@/data/billingMockData';
import { Invoice, InvoiceStatus, formatPrice } from '@/types/billing';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AllInvoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filtrar faturas
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: mockInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: mockInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    pending: mockInvoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.total, 0),
    overdue: mockInvoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleDownload = (invoice: Invoice) => {
    // Simula download de PDF gerando dados
    const content = `FATURA ${invoice.invoiceNumber}\n\nTenant: ${invoice.tenantName}\nValor: ${formatPrice(invoice.total)}\nVencimento: ${invoice.dueDate}\nStatus: ${invoice.status}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fatura_${invoice.invoiceNumber}.txt`;
    link.click();
    toast.success(`Fatura ${invoice.invoiceNumber} baixada!`);
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast.success(`Lembrete enviado para ${invoice.tenantName}`);
  };

  const handleExportAll = () => {
    const headers = ['Número', 'Tenant', 'Valor', 'Vencimento', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.tenantName,
        inv.total,
        inv.dueDate,
        inv.status
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `faturas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Faturas exportadas com sucesso!');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Todas as Faturas</h1>
            <p className="text-muted-foreground">Gerencie as faturas de todos os tenants</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportAll}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-cs-cyan hover:bg-cs-cyan/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Fatura
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Faturado</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(stats.total)}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Recebido</p>
              <p className="text-2xl font-bold text-cs-success">{formatPrice(stats.paid)}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-cs-warning">{formatPrice(stats.pending)}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Em Atraso</p>
              <p className="text-2xl font-bold text-cs-error">{formatPrice(stats.overdue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-cs-bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número ou tenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cs-bg-primary border-border"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | 'all')}>
                <SelectTrigger className="w-full md:w-48 bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Em Atraso</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle>Faturas</CardTitle>
            <CardDescription>{filteredInvoices.length} fatura(s) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceTable
              invoices={filteredInvoices}
              showTenant={true}
              onView={handleView}
              onDownload={handleDownload}
              onSendReminder={handleSendReminder}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal de Visualização de Fatura */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-cs-cyan" />
              Fatura {selectedInvoice?.invoiceNumber}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Detalhes completos da fatura
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Tenant</label>
                  <p className="text-sm text-foreground font-medium">{selectedInvoice.tenantName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedInvoice.status} type="invoice" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Valor Total</label>
                  <p className="text-lg text-foreground font-bold">{formatPrice(selectedInvoice.total)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Vencimento</label>
                  <p className="text-sm text-foreground">
                    {format(new Date(selectedInvoice.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Itens da Fatura</label>
                <div className="mt-2 space-y-2">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-foreground">{item.description}</span>
                      <span className="text-sm font-medium text-foreground">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-border"
                  onClick={() => handleDownload(selectedInvoice)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-cs-cyan to-cs-blue"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
