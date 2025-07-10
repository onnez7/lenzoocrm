import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, Edit, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService, SubscriptionPlan, CreatePlanData, UpdatePlanData } from "@/services/subscriptionService";

interface PlanManagementModalProps {
  onSuccess: () => void;
}

export default function PlanManagementModal({ onSuccess }: PlanManagementModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    max_users: 1,
    max_stores: 1,
    features: [''],
    billing_cycle: 'monthly',
    trial_days: 0,
    is_free: false,
    is_active: true
  });

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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      max_users: 1,
      max_stores: 1,
      features: [''],
      billing_cycle: 'monthly',
      trial_days: 0,
      is_free: false,
      is_active: true
    });
    setEditingPlan(null);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      max_users: plan.max_users,
      max_stores: plan.max_stores,
      features: plan.features,
      billing_cycle: plan.billing_cycle,
      trial_days: plan.trial_days,
      is_free: plan.is_free,
      is_active: plan.is_active
    });
    setShowForm(true);
  };

  const handleCreatePlan = () => {
    resetForm();
    setShowForm(true);
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({ 
        title: 'Erro', 
        description: 'Preencha todos os campos obrigatórios', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      const cleanFeatures = formData.features.filter(f => f.trim() !== '');
      
      if (editingPlan) {
        const data: UpdatePlanData = {
          ...formData,
          features: cleanFeatures
        };
        await subscriptionService.updatePlan(editingPlan.id, data, token!);
        toast({ 
          title: 'Sucesso', 
          description: 'Plano atualizado com sucesso!' 
        });
      } else {
        const data: CreatePlanData = {
          ...formData,
          features: cleanFeatures
        };
        await subscriptionService.createPlan(data, token!);
        toast({ 
          title: 'Sucesso', 
          description: 'Plano criado com sucesso!' 
        });
      }
      
      setShowForm(false);
      resetForm();
      onSuccess();
      
      // Recarregar planos
      const plansData = await subscriptionService.getAllPlans(token!);
      setPlans(plansData);
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao salvar plano', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Gestão de Planos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestão de Planos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!showForm ? (
            <>
              {/* Lista de Planos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Planos Disponíveis</h3>
                  <Button onClick={handleCreatePlan} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Plano
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={plan.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {plan.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {plan.is_free ? 'Grátis' : `R$ ${Number(plan.price).toFixed(2)}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            por {plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Máx. Usuários:</span>
                            <span className="font-medium">
                              {plan.max_users === -1 ? 'Ilimitado' : plan.max_users}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Máx. Lojas:</span>
                            <span className="font-medium">
                              {plan.max_stores === -1 ? 'Ilimitado' : plan.max_stores}
                            </span>
                          </div>
                          {plan.trial_days > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Trial:</span>
                              <span className="font-medium text-blue-600">{plan.trial_days} dias</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <h5 className="font-medium text-sm">Recursos:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {feature}
                              </li>
                            ))}
                            {plan.features.length > 3 && (
                              <li className="text-xs text-gray-500">
                                +{plan.features.length - 3} mais recursos
                              </li>
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {editingPlan ? 'Editar Plano' : 'Novo Plano'}
                  </h3>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Voltar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Plano *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Básico, Premium, Enterprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      disabled={formData.is_free}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva os benefícios do plano"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_users">Máx. Usuários</Label>
                    <Input
                      id="max_users"
                      type="number"
                      min="-1"
                      value={formData.max_users}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_users: parseInt(e.target.value) || 1 }))}
                    />
                    <p className="text-xs text-gray-500">-1 para ilimitado</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_stores">Máx. Lojas</Label>
                    <Input
                      id="max_stores"
                      type="number"
                      min="-1"
                      value={formData.max_stores}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_stores: parseInt(e.target.value) || 1 }))}
                    />
                    <p className="text-xs text-gray-500">-1 para ilimitado</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing_cycle">Ciclo de Cobrança</Label>
                    <Select value={formData.billing_cycle} onValueChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trial_days">Dias de Trial</Label>
                    <Input
                      id="trial_days"
                      type="number"
                      min="0"
                      value={formData.trial_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_free"
                      checked={formData.is_free}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_free: e.target.checked }))}
                    />
                    <Label htmlFor="is_free">Plano Gratuito</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <Label htmlFor="is_active">Plano Ativo</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Recursos Inclusos</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddFeature}>
                      <Plus className="mr-1 h-3 w-3" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="Ex: CRM completo, Suporte 24/7"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      editingPlan ? 'Atualizar Plano' : 'Criar Plano'
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 