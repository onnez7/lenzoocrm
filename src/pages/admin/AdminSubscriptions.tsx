import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Pause, 
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Calendar,
  Users,
  TrendingUp,
  XCircle,
  Loader2,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService, Subscription, SubscriptionPlan, SubscriptionMetrics } from "@/services/subscriptionService";
import CreateSubscriptionModal from "@/components/admin/subscription/CreateSubscriptionModal";
import EditSubscriptionModal from "@/components/admin/subscription/EditSubscriptionModal";
import PlanManagementModal from "@/components/admin/subscription/PlanManagementModal";

export default function AdminSubscriptions() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [franchises, setFranchises] = useState<any[]>([]);

  // Verificar se o usuário é SUPER_ADMIN
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      toast({ 
        title: 'Acesso Negado', 
        description: 'Apenas administradores matriz podem acessar esta área.', 
        variant: 'destructive' 
      });
      return;
    }
  }, [user, toast]);

  // Se não for SUPER_ADMIN, não renderiza nada
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const [subscriptionsData, plansData, metricsData] = await Promise.all([
          subscriptionService.getAllSubscriptions(token),
          subscriptionService.getAllPlans(token),
          subscriptionService.getMetrics(token)
        ]);
        
        setSubscriptions(subscriptionsData);
        setPlans(plansData);
        setMetrics(metricsData);
      } catch (error) {
        toast({ 
          title: 'Erro', 
          description: 'Erro ao carregar dados das assinaturas', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, toast]);

  // Carregar franquias para o modal de criação
  useEffect(() => {
    const loadFranchises = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/franchises', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const franchisesData = await response.json();
          setFranchises(franchisesData);
        }
      } catch (error) {
        console.error('Erro ao carregar franquias:', error);
      }
    };

    loadFranchises();
  }, [token]);

  const handleSuccess = () => {
    // Recarregar dados após operações
    const loadData = async () => {
      if (!token) return;
      
      try {
        const [subscriptionsData, plansData, metricsData] = await Promise.all([
          subscriptionService.getAllSubscriptions(token),
          subscriptionService.getAllPlans(token),
          subscriptionService.getMetrics(token)
        ]);
        
        setSubscriptions(subscriptionsData);
        setPlans(plansData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Erro ao recarregar dados:', error);
      }
    };

    loadData();
  };

  const handleCancelSubscription = async (subscription: Subscription) => {
    if (!token) return;
    
    try {
      await subscriptionService.cancelSubscription(subscription.id, true, token);
      toast({ 
        title: 'Sucesso', 
        description: 'Assinatura cancelada com sucesso!' 
      });
      handleSuccess();
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao cancelar assinatura', 
        variant: 'destructive' 
      });
    }
  };

  const handleReactivateSubscription = async (subscription: Subscription) => {
    if (!token) return;
    
    try {
      await subscriptionService.reactivateSubscription(subscription.id, token);
      toast({ 
        title: 'Sucesso', 
        description: 'Assinatura reativada com sucesso!' 
      });
      handleSuccess();
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao reativar assinatura', 
        variant: 'destructive' 
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'trialing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

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
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800">Não Paga</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'Básico':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Básico</Badge>;
      case 'Premium':
        return <Badge variant="outline" className="border-green-200 text-green-700">Premium</Badge>;
      case 'Enterprise':
        return <Badge variant="outline" className="border-purple-200 text-purple-700">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.franchise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = planFilter === 'all' || subscription.plan_name === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getDaysUntilRenewal = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando assinaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Assinaturas</h1>
          <p className="text-gray-600 mt-1">Controle completo de planos e cobranças dos franqueados</p>
        </div>
        <div className="flex gap-2">
          <PlanManagementModal onSuccess={handleSuccess} />
          <CreateSubscriptionModal franchises={franchises} onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_subscriptions}</div>
              <p className="text-xs text-gray-500">Assinaturas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.active_subscriptions}</div>
              <p className="text-xs text-gray-500">Pagando regularmente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Trial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.trial_subscriptions}</div>
              <p className="text-xs text-gray-500">Período experimental</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Churn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.canceled_subscriptions}</div>
              <p className="text-xs text-gray-500">Canceladas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">R$ {metrics.mrr.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Receita mensal recorrente</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Lista de Assinaturas</TabsTrigger>
          <TabsTrigger value="plans">Gestão de Planos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="billing">Cobrança</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas Ativas</CardTitle>
              <CardDescription>Lista completa de todas as assinaturas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por franqueado ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="trialing">Trial</SelectItem>
                    <SelectItem value="past_due">Vencida</SelectItem>
                    <SelectItem value="canceled">Cancelada</SelectItem>
                    <SelectItem value="unpaid">Não Paga</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Planos</SelectItem>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Assinaturas */}
              <div className="space-y-3">
                {filteredSubscriptions.map((subscription) => {
                  const daysUntilRenewal = getDaysUntilRenewal(subscription.current_period_end);
                  
                  return (
                    <div key={subscription.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(subscription.status)}
                            <CreditCard className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium">{subscription.franchise_name}</h4>
                            <p className="text-sm text-gray-500">
                              ID: {subscription.id}
                              {subscription.days_trial_remaining > 0 && (
                                <span className="ml-2 text-blue-600">
                                  • {subscription.days_trial_remaining} dias de trial restantes
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              R$ {subscription.amount.toFixed(2)}/mês
                            </div>
                            {getPlanBadge(subscription.plan_name)}
                          </div>
                          
                          <div className="text-right">
                            {getStatusBadge(subscription.status)}
                            <p className="text-xs text-gray-500 mt-1">
                              {daysUntilRenewal > 0 
                                ? `${daysUntilRenewal} dias até renovar`
                                : daysUntilRenewal === 0 
                                ? 'Renova hoje'
                                : `${Math.abs(daysUntilRenewal)} dias em atraso`
                              }
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <EditSubscriptionModal subscription={subscription} onSuccess={handleSuccess} />
                            
                            {subscription.status === 'active' ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCancelSubscription(subscription)}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : subscription.status === 'canceled' ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleReactivateSubscription(subscription)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            ) : subscription.status === 'past_due' ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleReactivateSubscription(subscription)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                        <span>
                          Período: {new Date(subscription.current_period_start).toLocaleDateString('pt-BR')} - {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                        </span>
                        <span>
                          Auto-renovação: {subscription.cancel_at_period_end ? 'Inativa' : 'Ativa'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSubscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma assinatura encontrada com os filtros aplicados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <Badge className={plan.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {plan.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {plan.is_free ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      por {plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Máx. Usuários:</span>
                      <span className="font-medium">{plan.max_users === -1 ? 'Ilimitado' : plan.max_users}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Máx. Lojas:</span>
                      <span className="font-medium">{plan.max_stores === -1 ? 'Ilimitado' : plan.max_stores}</span>
                    </div>
                    {plan.trial_days > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Trial:</span>
                        <span className="font-medium text-blue-600">{plan.trial_days} dias</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="font-medium text-sm">Recursos inclusos:</h5>
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análises de Assinaturas</CardTitle>
              <CardDescription>Métricas detalhadas e insights sobre as assinaturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                <p>Dashboard de análises em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Cobrança</CardTitle>
              <CardDescription>Configurações e processamento de cobranças</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="mx-auto h-12 w-12 mb-4" />
                <p>Sistema de cobrança em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
