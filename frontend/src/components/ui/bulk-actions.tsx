import { useState } from 'react';
import { Check, X, Trash2, Download, Archive, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { cn } from '@/lib/utils';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  requireConfirmation?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  onExecute: (selectedIds: string[]) => void | Promise<void>;
}

interface BulkActionsProps {
  selectedIds: string[];
  totalCount: number;
  actions: BulkAction[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedIds,
  totalCount,
  actions,
  onSelectAll,
  onClearSelection,
  className,
}: BulkActionsProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleAction = async (action: BulkAction) => {
    if (action.requireConfirmation) {
      setConfirmAction(action);
      return;
    }
    await executeAction(action);
  };

  const executeAction = async (action: BulkAction) => {
    setIsExecuting(true);
    try {
      await action.onExecute(selectedIds);
    } finally {
      setIsExecuting(false);
      setConfirmAction(null);
    }
  };

  const isAllSelected = selectedIds.length === totalCount;

  return (
    <>
      <div 
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
          'bg-card border border-border rounded-lg shadow-lg',
          'flex items-center gap-3 px-4 py-3',
          'animate-fade-in',
          className
        )}
      >
        {/* Selection info */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">
            {selectedIds.length} {selectedIds.length === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Select all / Clear */}
        <div className="flex items-center gap-2">
          {!isAllSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
            >
              Selecionar todos ({totalCount})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions.slice(0, 3).map((action) => (
            <Button
              key={action.id}
              variant={action.variant === 'destructive' ? 'destructive' : 'secondary'}
              size="sm"
              onClick={() => handleAction(action)}
              disabled={isExecuting}
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}
          
          {actions.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                {actions.slice(3).map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className={cn(
                      'cursor-pointer',
                      action.variant === 'destructive' && 'text-destructive'
                    )}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmTitle || 'Confirmar ação'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription || 
                `Esta ação será aplicada a ${selectedIds.length} ${selectedIds.length === 1 ? 'item' : 'itens'}. Deseja continuar?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              className={confirmAction?.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Hook for managing bulk selection
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(items.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const isAllSelected = selectedIds.length === items.length && items.length > 0;

  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
  };
}

// Checkbox component for table headers
export function BulkSelectCheckbox({
  isAllSelected,
  isIndeterminate,
  onToggle,
}: {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggle: () => void;
}) {
  return (
    <Checkbox
      checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
      onCheckedChange={onToggle}
      aria-label="Selecionar todos"
    />
  );
}

// Row checkbox component
export function BulkRowCheckbox({
  isSelected,
  onToggle,
}: {
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={onToggle}
      aria-label="Selecionar item"
    />
  );
}
