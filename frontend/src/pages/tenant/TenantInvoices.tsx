import { useState } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
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
import { ArrowLeft, Download, Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { mockInvoices, mockSubscriptions } from '@/data/billingMockData';
import { Invoice, InvoiceStatus, formatPrice } from '@/types/billing';
import { toast } from 'sonner';

export default function TenantInvoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  
  // Simula a assinatura atual do tenant
  const subscription = mockSubscriptions[0];
  
  // Faturas do tenant
  const tenantInvoices = mockInvoices.filter(inv => inv.tenantId === subscription.tenantId);
  
  // Aplicar filtros
  const filteredInvoices = tenantInvoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Resumo
  const totalPaid = tenantInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const totalPending = tenantInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const totalOverdue = tenantInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const handleDownload = (invoice: Invoice) => {
    toast.success(`Fatura ${invoice.invoiceNumber} baixada com sucesso!`);
  };

  const handleView = (invoice: Invoice) => {
    toast.info(`Visualizando fatura ${invoice.invoiceNumber}...`);
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast.success(`Lembrete enviado para ${invoice.tenantName}`);
  };

  return (
    <TenantLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/tenant/billing">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Faturas</h1>
            <p className="text-muted-foreground">Histórico completo de faturas e pagamentos</p>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pago</p>
                  <p className="text-2xl font-bold text-cs-success">{formatPrice(totalPaid)}</p>
                </div>
                <div className="p-3 rounded-lg bg-cs-success/10">
                  <FileText className="h-5 w-5 text-cs-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendente</p>
                  <p className="text-2xl font-bold text-cs-warning">{formatPrice(totalPending)}</p>
                </div>
                <div className="p-3 rounded-lg bg-cs-warning/10">
                  <FileText className="h-5 w-5 text-cs-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Atraso</p>
                  <p className="text-2xl font-bold text-cs-error">{formatPrice(totalOverdue)}</p>
                </div>
                <div className="p-3 rounded-lg bg-cs-error/10">
                  <FileText className="h-5 w-5 text-cs-error" />
                </div>
              </div>
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
                  placeholder="Buscar por número da fatura..."
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de faturas */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle>Faturas</CardTitle>
            <CardDescription>
              {filteredInvoices.length} fatura(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceTable
              invoices={filteredInvoices}
              showTenant={false}
              onDownload={handleDownload}
              onView={handleView}
              onSendReminder={handleSendReminder}
            />
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
}
