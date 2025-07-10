import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  DollarSign, 
  QrCode, 
  CheckCircle, 
  Clock, 
  XCircle,
  Loader2,
  Eye,
  Package
} from "lucide-react";
import { ServiceOrder } from "@/services/orderService";

interface OrderFinalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
  onFinalize: (data: FinalizationData) => Promise<void>;
}

export interface FinalizationData {
  paymentMethod: 'cash' | 'card' | 'pix';
  cardInstallments?: number;
  cardInterest?: number;
  totalPaid: number;
  productDelivered: boolean;
  status: 'completed' | 'in_progress' | 'cancelled';
  cancellationReason?: string;
  observations?: string;
}

const OrderFinalizationModal = ({ isOpen, onClose, order, onFinalize }: OrderFinalizationModalProps) => {
  const [formData, setFormData] = useState<FinalizationData>({
    paymentMethod: 'cash',
    totalPaid: 0,
    productDelivered: false,
    status: 'completed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar status baseado no status atual da ordem
  useEffect(() => {
    if (order) {
      if (order.status === 'pending') {
        setFormData(prev => ({ ...prev, status: 'in_progress' }));
      } else if (order.status === 'in_progress') {
        setFormData(prev => ({ ...prev, status: 'completed', productDelivered: true }));
      }
    }
  }, [order]);

  if (!order) return null;

  const orderTotal = Number(order.total_amount);
  const difference = formData.totalPaid - orderTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.totalPaid < orderTotal) {
      alert('O valor pago deve ser maior ou igual ao total da ordem');
      return;
    }

    if (formData.status === 'cancelled' && !formData.cancellationReason) {
      alert('É necessário informar o motivo do cancelamento');
      return;
    }

    try {
      setIsSubmitting(true);
      await onFinalize(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao finalizar ordem:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method as 'cash' | 'card' | 'pix',
      cardInstallments: method === 'card' ? 1 : undefined,
      cardInterest: method === 'card' ? 0 : undefined
    }));
  };

  const handleProductDeliveredChange = (delivered: boolean) => {
    setFormData(prev => ({
      ...prev,
      productDelivered: delivered,
      status: delivered ? 'completed' : 'in_progress'
    }));
  };

  const handleStatusChange = (newStatus: 'completed' | 'in_progress' | 'cancelled') => {
    // Regras de negócio para mudança de status
    if (order.status === 'pending') {
      // Pendente só pode ir para Em Andamento ou Cancelada
      if (newStatus === 'completed') {
        // Se tentar ir direto para Concluída, força Em Andamento primeiro
        setFormData(prev => ({
          ...prev,
          status: 'in_progress',
          productDelivered: false
        }));
        return;
      }
    } else if (order.status === 'in_progress') {
      // Em Andamento só pode ir para Concluída
      if (newStatus === 'cancelled') {
        return; // Não permite cancelar
      }
    } else if (order.status === 'completed' || order.status === 'cancelled') {
      // Concluída e Cancelada não podem mudar
      return;
    }

    setFormData(prev => ({
      ...prev,
      status: newStatus,
      productDelivered: newStatus === 'completed'
    }));
  };

  const calculateCardTotal = () => {
    if (formData.paymentMethod !== 'card' || !formData.cardInstallments) {
      return orderTotal;
    }
    
    const interest = formData.cardInterest || 0;
    const interestAmount = (orderTotal * interest) / 100;
    return orderTotal + interestAmount;
  };

  const cardTotal = calculateCardTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Finalizar Ordem {order.order_number}
          </DialogTitle>
          <DialogDescription>
            Complete o pagamento e defina o status da ordem
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Ordem */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
            <div>
              <Label className="text-sm font-medium">Cliente</Label>
              <div className="text-sm text-muted-foreground">{order.client_name}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Total da Ordem</Label>
              <div className="text-lg font-bold">R$ {orderTotal.toFixed(2)}</div>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-3">
            <Label>Forma de Pagamento</Label>
            <RadioGroup 
              value={formData.paymentMethod} 
              onValueChange={handlePaymentMethodChange}
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  Dinheiro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  Cartão
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                  <QrCode className="h-4 w-4" />
                  PIX
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Configurações do Cartão */}
          {formData.paymentMethod === 'card' && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="installments">Parcelas</Label>
                <Select 
                  value={formData.cardInstallments?.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    cardInstallments: parseInt(value) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interest">Juros (%)</Label>
                <Input
                  id="interest"
                  type="number"
                  step="0.01"
                  value={formData.cardInterest || 0}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cardInterest: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              <div className="col-span-2">
                <Label>Total com Juros</Label>
                <div className="text-lg font-bold text-blue-600">
                  R$ {cardTotal.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Valor Pago */}
          <div>
            <Label htmlFor="totalPaid">Valor Pago (R$)</Label>
            <Input
              id="totalPaid"
              type="number"
              step="0.01"
              min={orderTotal}
              value={formData.totalPaid}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                totalPaid: parseFloat(e.target.value) || 0 
              }))}
              placeholder="0,00"
            />
            {difference > 0 && (
              <div className="text-sm text-green-600 mt-1">
                Troco: R$ {difference.toFixed(2)}
              </div>
            )}
          </div>

          {/* Entrega do Produto */}
          <div className="space-y-3">
            <Label>Produto foi entregue?</Label>
            <RadioGroup 
              value={formData.productDelivered.toString()} 
              onValueChange={(value) => handleProductDeliveredChange(value === 'true')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="delivered" />
                <Label htmlFor="delivered" className="flex items-center gap-2 cursor-pointer">
                  <Package className="h-4 w-4" />
                  Sim, entregue
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="not-delivered" />
                <Label htmlFor="not-delivered" className="flex items-center gap-2 cursor-pointer">
                  <Clock className="h-4 w-4" />
                  Não, em produção
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Status da Ordem */}
          <div className="p-4 border rounded-lg">
            <Label>Status Final da Ordem</Label>
            <div className="mt-2 space-y-2">
              {order.status === 'pending' && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Ordem pendente - Escolha o próximo status:
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.status === 'in_progress' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('in_progress')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Em Andamento
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === 'cancelled' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('cancelled')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
              
              {order.status === 'in_progress' && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Ordem em andamento - Pode ser concluída:
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.status === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                  </div>
                </div>
              )}
              
              {(order.status === 'completed' || order.status === 'cancelled') && (
                <div className="text-sm text-muted-foreground">
                  Ordem {order.status === 'completed' ? 'concluída' : 'cancelada'} - Status não pode ser alterado
                </div>
              )}
              
              <div className="mt-2">
                <Badge className={
                  formData.status === 'completed' ? 'bg-green-100 text-green-800' :
                  formData.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }>
                  {formData.status === 'completed' ? 'Concluída' :
                   formData.status === 'in_progress' ? 'Em Andamento' : 'Cancelada'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Cancelamento */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cancelled"
                checked={formData.status === 'cancelled'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.checked ? 'cancelled' : 'completed',
                  productDelivered: e.target.checked ? false : prev.productDelivered
                }))}
              />
              <Label htmlFor="cancelled">Cliente desistiu</Label>
            </div>
            
            {formData.status === 'cancelled' && (
              <div>
                <Label htmlFor="cancellationReason">Motivo do Cancelamento</Label>
                <Select 
                  value={formData.cancellationReason} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    cancellationReason: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Preço alto</SelectItem>
                    <SelectItem value="no_money">Sem dinheiro</SelectItem>
                    <SelectItem value="changed_mind">Mudou de ideia</SelectItem>
                    <SelectItem value="found_elsewhere">Encontrou em outro lugar</SelectItem>
                    <SelectItem value="quality">Problema de qualidade</SelectItem>
                    <SelectItem value="other">Outro motivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                observations: e.target.value 
              }))}
              placeholder="Observações sobre o pagamento, entrega, etc..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Finalizar Ordem
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderFinalizationModal; 