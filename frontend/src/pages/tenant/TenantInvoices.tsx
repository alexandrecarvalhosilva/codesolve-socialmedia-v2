import { useState, useEffect } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, Search, FileText, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { useInvoices } from '@/hooks/useBilling';
import { Invoice, InvoiceStatus, formatPrice } from '@/types/billing';
import { toast } from 'sonner';

export default function TenantInvoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  
  const { invoices, isLoading, fetchInvoices } = useInvoices();

  useEffect(() => {
    fetchInvoices({ status: statusFilter !== 'all' ? statusFilter : undefined });
  }, [statusFilter]);

  const handleRefresh = () => {
    fetchInvoices({ status: statusFilter !== 'all' ? statusFilter : undefined });
    toast.success('Lista atualizada');
  };
  
  // Aplicar filtros locais
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Resumo
  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  
  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  
  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const handleDownload = (invoice: Invoice) => {
    toast.success(`Fatura ${invoice.invoiceNumber || invoice.id} baixada com sucesso!`);
  };

  const handleView = (invoice: Invoice) => {
    toast.info(`Visualizando fatura ${invoice.invoiceNumber || invoice.id}...`);
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast.success(`Lembrete enviado`);
  };

  if (isLoading) {
    return (
      <TenantLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-cs-bg-card border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-2xl font-bold text-cs-success">{formatPrice(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-cs-warning">{formatPrice(totalPending)}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Em Atraso</p>
              <p className="text-2xl font-bold text-cs-error">{formatPrice(totalOverdue)}</p>
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
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="overdue">Em Atraso</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de faturas */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle>Faturas</CardTitle>
            <CardDescription>{filteredInvoices.length} fatura(s) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
              </div>
            ) : (
              <InvoiceTable
                invoices={filteredInvoices}
                onDownload={handleDownload}
                onView={handleView}
                onSendReminder={handleSendReminder}
                showTenant={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
}
