import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Plus, Edit, Trash2, Copy, Tag, RefreshCw } from 'lucide-react';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/hooks/useBilling';
import { DiscountCoupon, formatPrice } from '@/types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ManageCoupons() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    maxUses: 0,
    expiresAt: '',
    isActive: true,
  });

  const { coupons, isLoading, fetchCoupons } = useCoupons();
  const { createCoupon, isCreating } = useCreateCoupon();
  const { updateCoupon, isUpdating } = useUpdateCoupon();
  const { deleteCoupon, isDeleting } = useDeleteCoupon();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleRefresh = () => {
    fetchCoupons();
    toast.success('Lista atualizada');
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: 0,
      expiresAt: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditCoupon = (coupon: DiscountCoupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses || 0,
      expiresAt: coupon.expiresAt ? format(new Date(coupon.expiresAt), 'yyyy-MM-dd') : '',
      isActive: coupon.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (coupon: DiscountCoupon) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive });
      toast.success('Status do cupom atualizado');
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar cupom');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await deleteCoupon(couponId);
      toast.success('Cupom excluído');
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir cupom');
    }
  };

  const handleSaveCoupon = async () => {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, formData);
        toast.success('Cupom atualizado');
      } else {
        await createCoupon(formData);
        toast.success('Cupom criado');
      }
      setIsDialogOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar cupom');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Tag className="w-7 h-7 text-primary" />
              Cupons de Desconto
            </h1>
            <p className="text-muted-foreground">Gerencie cupons promocionais</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleCreateCoupon}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cupom
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-muted-foreground">Inativos</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {coupons.filter(c => !c.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total de Usos</p>
              <p className="text-2xl font-bold text-foreground">
                {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle>Cupons</CardTitle>
            <CardDescription>{coupons.length} cupom(s) cadastrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-cs-bg-primary rounded text-sm">
                          {coupon.code}
                        </code>
                        <Button variant="ghost" size="icon" onClick={() => copyCode(coupon.code)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%` 
                        : formatPrice(coupon.discountValue)}
                    </TableCell>
                    <TableCell>
                      {coupon.usedCount || 0} / {coupon.maxUses || '∞'}
                    </TableCell>
                    <TableCell>
                      {coupon.expiresAt 
                        ? format(new Date(coupon.expiresAt), 'dd/MM/yyyy', { locale: ptBR })
                        : 'Sem validade'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => handleToggleActive(coupon)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-cs-error hover:text-cs-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog de criação/edição */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Atualize as informações do cupom' : 'Crie um novo cupom de desconto'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="DESCONTO10"
                  className="bg-cs-bg-primary border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountType">Tipo de Desconto</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(v) => setFormData({ ...formData, discountType: v as 'percentage' | 'fixed' })}
                  >
                    <SelectTrigger className="bg-cs-bg-primary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem</SelectItem>
                      <SelectItem value="fixed">Valor Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discountValue">Valor</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="bg-cs-bg-primary border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUses">Máximo de Usos (0 = ilimitado)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                    className="bg-cs-bg-primary border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Validade</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="bg-cs-bg-primary border-border"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Cupom ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCoupon} disabled={isCreating || isUpdating}>
                {editingCoupon ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
