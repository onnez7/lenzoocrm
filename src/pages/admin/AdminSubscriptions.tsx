
import { useState } from "react";
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
  XCircle
} from "lucide-react";
import { mockTenants, mockPlans } from "@/lib/saas-schema";

const mockSubscriptions = [
  {
    id: 'sub_001',
    tenantId: '1',
    tenantName: 'Ótica Visão Clara',
    plan: 'premium',
    status: 'active',
    currentPeriodStart: '2024-11-15',
    currentPeriodEnd: '2024-12-15',
    amount: 199.90,
    nextBilling: '2024-12-15',
    daysTrial: 0,
    autoRenew: true
  },
  {
    id: 'sub_002',
    tenantId: '2',
    tenantName: 'Ótica Moderna',
    plan: 'basic',
    status: 'trialing',
    currentPeriodStart: '2024-12-01',
    currentPeriodEnd: '2024-12-15',
    amount: 99.90,
    nextBilling: '2024-12-15',
    daysTrial: 5,
    autoRenew: true
  },
  {
    id: 'sub_003',
    tenantId: '3',
    tenantName: 'Ótica Central',
    plan: 'premium',
    status: 'past_due',
    currentPeriodStart: '2024-11-10',
    currentPeriodEnd: '2024-12-10',
    amount: 199.90,
    nextBilling: '2024-12-10',
    daysTrial: 0,
    autoRenew: true
  },
  {
    id: 'sub_004',
    tenantId: '4',
    tenantName: 'Ótica Vista Bela',
    plan: 'enterprise',
    status: 'canceled',
    currentPeriodStart: '2024-10-15',
    currentPeriodEnd: '2024-11-15',
    amount: 399.90,
    nextBilling: null,
    daysTrial: 0,
    autoRenew: false
  }
];

export default function AdminSubscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

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
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Básico</Badge>;
      case 'premium':
        return <Badge variant="outline" className="border-green-200 text-green-700">Premium</Badge>;
      case 'enterprise':
        return <Badge variant="outline" className="border-purple-200 text-purple-700">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const filteredSubscriptions = mockSubscriptions.filter(subscription => {
    const matchesSearch = subscription.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = planFilter === 'all' || subscription.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Métricas
  const totalSubscriptions = mockSubscriptions.length;
  const activeSubscriptions = mockSubscriptions.filter(s => s.status === 'active').length;
  const trialSubscriptions = mockSubscriptions.filter(s => s.status === 'trialing').length;
  const churnedSubscriptions = mockSubscriptions.filter(s => s.status === 'canceled').length;
  const mrr = mockSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const getDaysUntilRenewal = (nextBilling: string | null) => {
    if (!nextBilling) return null;
    const today = new Date();
    const billing = new Date(nextBilling);
    const diffTime = billing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Assinaturas</h1>
          <p className="text-gray-600 mt-1">Controle completo de planos e cobranças dos franqueados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros Avançados
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptions}</div>
            <p className="text-xs text-gray-500">Assinaturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscriptions}</div>
            <p className="text-xs text-gray-500">Pagando regularmente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Trial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{trialSubscriptions}</div>
            <p className="text-xs text-gray-500">Período experimental</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{churnedSubscriptions}</div>
            <p className="text-xs text-gray-500">Canceladas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">R$ {mrr.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Receita mensal recorrente</p>
          </CardContent>
        </Card>
      </div>

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
                  </SelectContent>
                </Select>
                
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Planos</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Assinaturas */}
              <div className="space-y-3">
                {filteredSubscriptions.map((subscription, index) => {
                  const daysUntilRenewal = getDaysUntilRenewal(subscription.nextBilling);
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(subscription.status)}
                            <CreditCard className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium">{subscription.tenantName}</h4>
                            <p className="text-sm text-gray-500">
                              ID: {subscription.id}
                              {subscription.daysTrial > 0 && (
                                <span className="ml-2 text-blue-600">
                                  • {subscription.daysTrial} dias de trial restantes
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
                            {getPlanBadge(subscription.plan)}
                          </div>
                          
                          <div className="text-right">
                            {getStatusBadge(subscription.status)}
                            {daysUntilRenewal !== null && (
                              <p className="text-xs text-gray-500 mt-1">
                                {daysUntilRenewal > 0 
                                  ? `${daysUntilRenewal} dias até renovar`
                                  : daysUntilRenewal === 0 
                                  ? 'Renova hoje'
                                  : `${Math.abs(daysUntilRenewal)} dias em atraso`
                                }
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {subscription.status === 'active' ? (
                              <Button variant="ghost" size="sm">
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : subscription.status === 'canceled' ? null : (
                              <Button variant="ghost" size="sm">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                        <span>
                          Período: {new Date(subscription.currentPeriodStart).toLocaleDateString('pt-BR')} - {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                        </span>
                        <span>
                          Auto-renovação: {subscription.autoRenew ? 'Ativa' : 'Inativa'}
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
            {mockPlans.map((plan, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <Badge className={plan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {plan.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      R$ {plan.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">por mês</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Máx. Usuários:</span>
                      <span className="font-medium">{plan.maxUsers === -1 ? 'Ilimitado' : plan.maxUsers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Máx. Lojas:</span>
                      <span className="font-medium">{plan.maxStores === -1 ? 'Ilimitado' : plan.maxStores}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="font-medium text-sm">Recursos inclusos:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    <Button 
                      variant={plan.isActive ? "destructive" : "default"} 
                      size="sm" 
                      className="flex-1"
                    >
                      {plan.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
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
