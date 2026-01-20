import { Eye, Download, Mail, MoreHorizontal, CreditCard } from 'lucide-react';
import { Invoice, formatPrice } from '@/types/billing';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvoiceTableProps {
  invoices: Invoice[];
  showTenant?: boolean;
  onView?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
}

export function InvoiceTable({ 
  invoices, 
  showTenant = false,
  onView,
  onDownload,
  onSendReminder
}: InvoiceTableProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-cs-bg-primary/50 hover:bg-cs-bg-primary/50">
            <TableHead className="text-cs-text-secondary">Nº Fatura</TableHead>
            {showTenant && (
              <TableHead className="text-cs-text-secondary">Tenant</TableHead>
            )}
            <TableHead className="text-cs-text-secondary">Período</TableHead>
            <TableHead className="text-cs-text-secondary">Valor</TableHead>
            <TableHead className="text-cs-text-secondary">Vencimento</TableHead>
            <TableHead className="text-cs-text-secondary">Status</TableHead>
            <TableHead className="text-cs-text-secondary text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={showTenant ? 7 : 6} 
                className="h-32"
              >
                <EmptyState
                  icon={CreditCard}
                  title="Nenhuma fatura encontrada"
                  description="As faturas aparecerão aqui quando forem geradas"
                  variant="compact"
                />
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow 
                key={invoice.id}
                className="hover:bg-cs-bg-primary/30"
              >
                <TableCell className="font-medium text-cs-text-primary">
                  {invoice.invoiceNumber}
                </TableCell>
                {showTenant && (
                  <TableCell className="text-cs-text-secondary">
                    {invoice.tenantName}
                  </TableCell>
                )}
                <TableCell className="text-cs-text-secondary">
                  {invoice.items[0]?.periodStart 
                    ? format(new Date(invoice.items[0].periodStart), 'MMM/yyyy', { locale: ptBR })
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-cs-text-primary font-medium">
                  {formatPrice(invoice.total)}
                </TableCell>
                <TableCell className="text-cs-text-secondary">
                  {formatDate(invoice.dueDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} type="invoice" size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-cs-bg-card border-border">
                      <DropdownMenuItem 
                        onClick={() => onView?.(invoice)}
                        className="text-cs-text-secondary hover:text-cs-text-primary"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDownload?.(invoice)}
                        className="text-cs-text-secondary hover:text-cs-text-primary"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar PDF
                      </DropdownMenuItem>
                      {invoice.status === 'overdue' && (
                        <DropdownMenuItem 
                          onClick={() => onSendReminder?.(invoice)}
                          className="text-cs-warning hover:text-cs-warning"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Enviar Lembrete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
