import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService, Subscription, SubscriptionPlan, UpdateSubscriptionData } from "@/services/subscriptionService";

interface EditSubscriptionModalProps {
  subscription: Subscription;
  onSuccess: () => void;
}

export default function EditSubscriptionModal({ subscription, onSuccess }: EditSubscriptionModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(subscription.plan_id.toString());
  const [billingCycle, setBillingCycle] = useState<string>(subscription.billing_cycle);

  // Carregar planos
  useEffect(() => {
    const loadPlans = async () => {
      if (!token) return;
      
      try {
        const plansData = await subscriptionService.getAllPlans(token);
        setPlans(plansData);
      } catch (error) {
        toast({ 
          title: 'Erro', 
          description: 'Erro ao carregar planos', 
          variant: 'destructive' 
        });
      }
    };

    if (open) {
      loadPlans();
    }
  }, [open, token, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      toast({ 
        title: 'Erro', 
        description: 'Selecione um plano', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      const data: UpdateSubscriptionData = {
        plan_id: parseInt(selectedPlan),
        billing_cycle: billingCycle,
      };

      await subscriptionService.updateSubscription(subscription.id, data, token!);
      
      toast({ 
        title: 'Sucesso', 
        description: 'Assinatura atualizada com sucesso!' 
      });
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao atualizar assinatura', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(plan => plan.id.toString() === selectedPlan);
  const currentPlanData = plans.find(plan => plan.id === subscription.plan_id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Vencida</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Assinatura</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Atuais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assinatura Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Franquia</Label>
                  <p className="font-medium">{subscription.franchise_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(subscription.status)}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Plano Atual</Label>
                  <p className="font-medium">{subscription.plan_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Valor Atual</Label>
                  <p className="font-medium">R$ {subscription.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Ciclo de Cobrança</Label>
                  <p className="font-medium capitalize">{subscription.billing_cycle}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Próxima Cobrança</Label>
                  <p className="font-medium">
                    {subscription.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Novo Plano */}
          <div className="space-y-2">
            <Label htmlFor="plan">Novo Plano *</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans
                  .filter(plan => plan.is_active)
                  .map(plan => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} - R$ {plan.price.toFixed(2)}/{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ciclo de Cobrança */}
          <div className="space-y-2">
            <Label htmlFor="billing-cycle">Ciclo de Cobrança</Label>
            <Select value={billingCycle} onValueChange={setBillingCycle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resumo do Novo Plano */}
          {selectedPlanData && selectedPlanData.id !== subscription.plan_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Novo Plano</CardTitle>
                <CardDescription>Detalhes do plano selecionado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    R$ {selectedPlanData.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    por {billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Máx. Usuários:</span>
                    <span className="font-medium">
                      {selectedPlanData.max_users === -1 ? 'Ilimitado' : selectedPlanData.max_users}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Máx. Lojas:</span>
                    <span className="font-medium">
                      {selectedPlanData.max_stores === -1 ? 'Ilimitado' : selectedPlanData.max_stores}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h5 className="font-medium text-sm">Recursos inclusos:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {selectedPlanData.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aviso sobre mudança de plano */}
          {selectedPlanData && selectedPlanData.id !== subscription.plan_id && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Mudança de Plano</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      A mudança de plano será aplicada imediatamente. O valor será ajustado proporcionalmente 
                      ao período restante da assinatura atual.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Assinatura'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 