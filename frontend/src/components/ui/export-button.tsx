import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename?: string;
  columns?: { key: string; label: string }[];
  onExport?: (format: 'csv' | 'json') => void;
  className?: string;
}

export function ExportButton({ 
  data, 
  filename = 'export', 
  columns,
  onExport,
  className 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      if (data.length === 0) {
        toast.error('Não há dados para exportar');
        return;
      }

      // Get headers
      const headers = columns 
        ? columns.map(c => c.label)
        : Object.keys(data[0]);
      
      const keys = columns 
        ? columns.map(c => c.key)
        : Object.keys(data[0]);

      // Build CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          keys.map(key => {
            const value = row[key];
            // Handle special characters and commas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          }).join(',')
        )
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success('CSV exportado com sucesso!');
      onExport?.('csv');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      if (data.length === 0) {
        toast.error('Não há dados para exportar');
        return;
      }

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success('JSON exportado com sucesso!');
      onExport?.('json');
    } catch (error) {
      toast.error('Erro ao exportar JSON');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isExporting || data.length === 0}
          className={className}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Exportar JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple CSV export function for use elsewhere
export function downloadCSV(
  data: Record<string, unknown>[], 
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (data.length === 0) return;

  const headers = columns 
    ? columns.map(c => c.label)
    : Object.keys(data[0]);
  
  const keys = columns 
    ? columns.map(c => c.key)
    : Object.keys(data[0]);

  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
