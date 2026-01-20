import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Copy, Tag } from 'lucide-react';
import { mockCoupons } from '@/data/billingMockData';
import { DiscountCoupon, formatPrice } from '@/types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const handleEditCoupon = (coupon: DiscountCoupon) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (couponId: string) => {
    setCoupons(coupons.map(c => 
      c.id === couponId ? { ...c, isActive: !c.isActive } : c
    ));
    toast.success('Status do cupom atualizado');
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons(coupons.filter(c => c.id !== couponId));
    toast.success('Cupom excluído');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  const handleSaveCoupon = () => {
    toast.success(editingCoupon ? 'Cupom atualizado!' : 'Cupom criado!');
    setIsDialogOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getDiscountLabel = (coupon: DiscountCoupon) => {
    if (coupon.discountType === 'percent') {
      return `${coupon.discountValue}%`;
    }
    return formatPrice(coupon.discountValue);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cupons de Desconto</h1>
            <p className="text-muted-foreground">Gerencie cupons promocionais</p>
          </div>
          <Button onClick={handleCreateCoupon} className="bg-cs-cyan hover:bg-cs-cyan/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cupom
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total de Cupons</p>
              <p className="text-2xl font-bold text-foreground">{coupons.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold text-cs-success">
                {coupons.filter(c => c.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Utilizações</p>
              <p className="text-2xl font-bold text-primary">
                {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Expirados</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {coupons.filter(c => c.validUntil && new Date(c.validUntil) < new Date()).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Cupons */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Cupons
            </CardTitle>
            <CardDescription>{coupons.length} cupom(s) cadastrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-cs-bg-primary/50 hover:bg-cs-bg-primary/50">
                    <TableHead className="text-cs-text-secondary">Código</TableHead>
                    <TableHead className="text-cs-text-secondary">Desconto</TableHead>
                    <TableHead className="text-cs-text-secondary">Usos</TableHead>
                    <TableHead className="text-cs-text-secondary">Validade</TableHead>
                    <TableHead className="text-cs-text-secondary">Status</TableHead>
                    <TableHead className="text-cs-text-secondary text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => {
                    const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
                    return (
                      <TableRow key={coupon.id} className="hover:bg-cs-bg-primary/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-cs-bg-primary rounded text-primary font-mono">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyCode(coupon.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-cs-cyan border-cs-cyan">
                            {getDiscountLabel(coupon)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {coupon.usedCount}
                          {coupon.maxUses && ` / ${coupon.maxUses}`}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {coupon.validFrom && formatDate(coupon.validFrom)} -{' '}
                          {formatDate(coupon.validUntil)}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <Badge variant="secondary">Expirado</Badge>
                          ) : coupon.isActive ? (
                            <Badge className="bg-cs-success/20 text-cs-success border-cs-success/30">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Switch
                              checked={coupon.isActive}
                              onCheckedChange={() => handleToggleActive(coupon.id)}
                              disabled={isExpired}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCoupon(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="text-cs-error hover:text-cs-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog de Edição/Criação */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-cs-bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes do cupom de desconto
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input 
                  defaultValue={editingCoupon?.code}
                  placeholder="Ex: PROMO20"
                  className="bg-cs-bg-primary border-border uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <Select defaultValue={editingCoupon?.discountType || 'percent'}>
                  <SelectTrigger className="bg-cs-bg-primary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor do Desconto</Label>
                <Input 
                  type="number"
                  defaultValue={editingCoupon?.discountValue}
                  placeholder="20"
                  className="bg-cs-bg-primary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Limite de Usos</Label>
                <Input 
                  type="number"
                  defaultValue={editingCoupon?.maxUses || ''}
                  placeholder="Vazio = ilimitado"
                  className="bg-cs-bg-primary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Válido De</Label>
                <Input 
                  type="date"
                  defaultValue={editingCoupon?.validFrom?.split('T')[0]}
                  className="bg-cs-bg-primary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Válido Até</Label>
                <Input 
                  type="date"
                  defaultValue={editingCoupon?.validUntil?.split('T')[0]}
                  className="bg-cs-bg-primary border-border"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input 
                  defaultValue={editingCoupon?.description || ''}
                  placeholder="Descrição interna do cupom"
                  className="bg-cs-bg-primary border-border"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCoupon} className="bg-cs-cyan hover:bg-cs-cyan/90">
                {editingCoupon ? 'Salvar' : 'Criar Cupom'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
