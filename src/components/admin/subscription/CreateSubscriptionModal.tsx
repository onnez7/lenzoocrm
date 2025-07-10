import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService, SubscriptionPlan, CreateSubscriptionData } from "@/services/subscriptionService";

interface Franchise {
  id: number;
  name: string;
  email: string;
  status: string;
}

interface CreateSubscriptionModalProps {
  franchises: Franchise[];
  onSuccess: () => void;
}

export default function CreateSubscriptionModal({ franchises, onSuccess }: CreateSubscriptionModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');

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
    
    if (!selectedFranchise || !selectedPlan) {
      toast({ 
        title: 'Erro', 
        description: 'Preencha todos os campos obrigatórios', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      const data: CreateSubscriptionData = {
        franchise_id: parseInt(selectedFranchise),
        plan_id: parseInt(selectedPlan),
        billing_cycle: billingCycle,
      };

      await subscriptionService.createSubscription(data, token!);
      
      toast({ 
        title: 'Sucesso', 
        description: 'Assinatura criada com sucesso!' 
      });
      
      setOpen(false);
      onSuccess();
      
      // Reset form
      setSelectedFranchise('');
      setSelectedPlan('');
      setBillingCycle('monthly');
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao criar assinatura', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(plan => plan.id.toString() === selectedPlan);
  const selectedFranchiseData = franchises.find(franchise => franchise.id.toString() === selectedFranchise);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Assinatura
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Assinatura</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Franquia */}
          <div className="space-y-2">
            <Label htmlFor="franchise">Franquia *</Label>
            <Select value={selectedFranchise} onValueChange={setSelectedFranchise}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma franquia" />
              </SelectTrigger>
              <SelectContent>
                {franchises
                  .filter(franchise => franchise.status === 'active')
                  .map(franchise => (
                    <SelectItem key={franchise.id} value={franchise.id.toString()}>
                      {franchise.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Plano */}
          <div className="space-y-2">
            <Label htmlFor="plan">Plano *</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans
                  .filter(plan => plan.is_active)
                  .map(plan => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} - R$ {Number(plan.price).toFixed(2)}/{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
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

          {/* Resumo do Plano Selecionado */}
          {selectedPlanData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedPlanData.name}</CardTitle>
                <CardDescription>{selectedPlanData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    R$ {Number(selectedPlanData.price).toFixed(2)}
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
                  {selectedPlanData.trial_days > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Dias de Trial:</span>
                      <span className="font-medium text-blue-600">{selectedPlanData.trial_days} dias</span>
                    </div>
                  )}
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

          {/* Resumo da Franquia Selecionada */}
          {selectedFranchiseData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Franquia Selecionada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nome:</span>
                    <span className="font-medium">{selectedFranchiseData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium">{selectedFranchiseData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={selectedFranchiseData.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {selectedFranchiseData.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
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
            <Button type="submit" disabled={loading || !selectedFranchise || !selectedPlan}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Assinatura'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 