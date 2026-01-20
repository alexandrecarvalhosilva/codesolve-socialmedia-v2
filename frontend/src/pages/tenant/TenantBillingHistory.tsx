import { useState } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlanChangeHistoryTable } from '@/components/billing/PlanChangeHistoryTable';
import { CreditsCard } from '@/components/billing/CreditsCard';
import { 
  getPlanChangeHistoryByTenant, 
  getCreditTransactionsByTenant, 
  getTenantCreditBalance 
} from '@/data/planChangeHistoryMock';

export default function TenantBillingHistory() {
  // Simula o tenant atual (ID 1)
  const tenantId = '1';
  
  const planChangeHistory = getPlanChangeHistoryByTenant(tenantId);
  const creditTransactions = getCreditTransactionsByTenant(tenantId);
  const creditBalance = getTenantCreditBalance(tenantId);

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
            <h1 className="text-2xl font-bold text-foreground">Histórico e Créditos</h1>
            <p className="text-muted-foreground">
              Acompanhe suas alterações de plano e saldo de créditos
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="bg-cs-bg-card border border-border">
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico de Planos
            </TabsTrigger>
            <TabsTrigger value="credits" className="gap-2">
              <Wallet className="h-4 w-4" />
              Créditos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            <PlanChangeHistoryTable history={planChangeHistory} />
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <CreditsCard
              balance={creditBalance}
              transactions={creditTransactions}
              showFullHistory
            />
          </TabsContent>
        </Tabs>
      </div>
    </TenantLayout>
  );
}