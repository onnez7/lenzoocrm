import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunityKanban } from "@/components/crm/OpportunityKanban";
import { opportunityService } from "@/services/opportunityService";
import { clientService, Client } from "@/services/clientService";
import { api } from "@/config/api";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Plus,
  Phone,
  Mail,
  Eye,
  BarChart3,
  PieChart
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DashboardStats {
  totalOpportunities: number;
  totalValue: number;
  opportunitiesByStatus: {
    [key: string]: number;
  };
  recentActivities: number;
  conversionRate: number;
}

interface ReportData {
  monthlyRevenue: { month: string; value: number }[];
  topOpportunities: any[];
  performanceMetrics: {
    avgDealSize: number;
    avgDealCycle: number;
    winRate: number;
    totalClients: number;
  };
}

const CRM = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOpportunities: 0,
    totalValue: 0,
    opportunitiesByStatus: {},
    recentActivities: 0,
    conversionRate: 0
  });
  const [reportData, setReportData] = useState<ReportData>({
    monthlyRevenue: [],
    topOpportunities: [],
    performanceMetrics: {
      avgDealSize: 0,
      avgDealCycle: 0,
      winRate: 0,
      totalClients: 0
    }
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNewOpportunityModal, setShowNewOpportunityModal] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    value: '',
    stage: 'lead',
    client_id: '',
    notes: ''
  });
  const [availableClients, setAvailableClients] = useState<Client[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadClients();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadAvailableClients();
  }, []);

  const loadAvailableClients = async () => {
    try {
      const response = await clientService.getAllClients({ limit: 1000 });
      setAvailableClients(response.clients);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleCreateOpportunity = async () => {
    try {
      const token = localStorage.getItem('lenzooToken');
      if (!token) {
        console.error('Token não encontrado - usuário não autenticado');
        return;
      }

      // Usar a instância configurada da API
      await api.post('/opportunities', {
        title: newOpportunity.title,
        value: parseFloat(newOpportunity.value),
        stage: newOpportunity.stage,
        client_id: parseInt(newOpportunity.client_id),
        notes: newOpportunity.notes
      });

      // Limpar formulário e fechar modal
      setNewOpportunity({
        title: '',
        value: '',
        stage: 'lead',
        client_id: '',
        notes: ''
      });
      setShowNewOpportunityModal(false);

      // Recarregar dados
      loadDashboardData();
    } catch (error: any) {
      console.error('Erro ao criar oportunidade:', error);
      if (error.response?.status === 401) {
        console.error('Erro de autenticação - verifique se está logado');
        // Aqui você pode redirecionar para login ou mostrar mensagem
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Verificar se há token
      const token = localStorage.getItem('lenzooToken');
      if (!token) {
        console.error('Token não encontrado - usuário não autenticado');
        setLoading(false);
        return;
      }
      
      // Carregar oportunidades usando a instância configurada da API
      const opportunitiesResponse = await api.get('/opportunities');
      const opportunities = opportunitiesResponse.data;
      
      // Carregar estatísticas de clientes
      const clientsData = await clientService.getAllClients({ limit: 1000 });
      
      // Calcular estatísticas
      const totalValue = opportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0);
      const opportunitiesByStatus = opportunities.reduce((acc: any, opp: any) => {
        acc[opp.status] = (acc[opp.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Calcular taxa de conversão (oportunidades fechadas / total)
      const closedOpportunities = opportunities.filter((opp: any) => opp.status === 'closed_won').length;
      const conversionRate = opportunities.length > 0 ? (closedOpportunities / opportunities.length) * 100 : 0;

      // Calcular métricas de performance
      const wonOpportunities = opportunities.filter((opp: any) => opp.status === 'closed_won');
      const avgDealSize = wonOpportunities.length > 0 
        ? wonOpportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0) / wonOpportunities.length 
        : 0;

      const winRate = opportunities.length > 0 ? (wonOpportunities.length / opportunities.length) * 100 : 0;

      setStats({
        totalOpportunities: opportunities.length,
        totalValue,
        opportunitiesByStatus,
        recentActivities: opportunities.filter((opp: any) => {
          // Verificar se a oportunidade foi criada na última semana
          const oppDate = new Date(opp.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return oppDate > weekAgo;
        }).length,
        conversionRate
      });

      // Preparar dados de relatório
      const topOpportunities = opportunities
        .filter((opp: any) => opp.value && opp.value > 0)
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
        .slice(0, 5);

      setReportData({
        monthlyRevenue: generateMonthlyRevenue(opportunities),
        topOpportunities,
        performanceMetrics: {
          avgDealSize,
          avgDealCycle: 45, // Valor estimado
          winRate,
          totalClients: clientsData.clients.length
        }
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
      if (error.response?.status === 401) {
        console.error('Erro de autenticação - verifique se está logado');
        // Aqui você pode redirecionar para login ou mostrar mensagem
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenue = (opportunities: any[]) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthOpportunities = opportunities.filter(opp => {
        if (opp.status !== 'closed_won') return false;
        const oppDate = new Date(opp.created_at);
        return oppDate.getFullYear() === currentYear && oppDate.getMonth() === index;
      });
      
      const value = monthOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
      return { month, value };
    });
  };

  const loadClients = async () => {
    try {
      setClientsLoading(true);
      const response = await clientService.getAllClients({
        page: currentPage,
        limit: 20,
        search: searchTerm
      });
      setClients(response.clients);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setClientsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'text-blue-600';
      case 'proposal': return 'text-yellow-600';
      case 'negotiation': return 'text-orange-600';
      case 'closed_won': return 'text-green-600';
      case 'closed_lost': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'lead': return 'Leads';
      case 'proposal': return 'Propostas';
      case 'negotiation': return 'Negociação';
      case 'closed_won': return 'Fechadas (Ganhas)';
      case 'closed_lost': return 'Fechadas (Perdidas)';
      default: return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Debug de autenticação */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Debug - Autenticação</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Token lenzooToken: {localStorage.getItem('lenzooToken') ? 'Presente' : 'Ausente'}</p>
            <p>Token token: {localStorage.getItem('token') ? 'Presente' : 'Ausente'}</p>
            <p>Usuário: {localStorage.getItem('lenzooUser') || 'Não encontrado'}</p>
            {localStorage.getItem('lenzooToken') && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <p className="font-medium">Token JWT:</p>
                <p className="break-all">{localStorage.getItem('lenzooToken')}</p>
                <p className="mt-1 text-gray-600">
                  Decodifique em: <a href="https://jwt.io" target="_blank" className="text-blue-600 underline">jwt.io</a>
                </p>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={async () => {
                  try {
                    const response = await api.get('/opportunities');
                    console.log('Teste API:', response.data);
                    alert('API funcionando!');
                  } catch (error) {
                    console.error('Erro teste API:', error);
                    alert('Erro na API: ' + error);
                  }
                }}
              >
                Testar API
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={async () => {
                  try {
                    const response = await api.get('/opportunities/debug');
                    console.log('Debug API:', response.data);
                    alert('Debug: ' + JSON.stringify(response.data, null, 2));
                  } catch (error) {
                    console.error('Erro debug API:', error);
                    alert('Erro debug: ' + error);
                  }
                }}
              >
                Debug Token
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={async () => {
                  try {
                    const response = await api.get('/opportunities/test');
                    console.log('Test API:', response.data);
                    alert('Test: ' + JSON.stringify(response.data, null, 2));
                  } catch (error) {
                    console.error('Erro test API:', error);
                    alert('Erro test: ' + error);
                  }
                }}
              >
                Test Simple
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={async () => {
                  try {
                    const response = await api.get('/opportunities/test-query');
                    console.log('Test Query API:', response.data);
                    alert('Test Query: ' + JSON.stringify(response.data, null, 2));
                  } catch (error) {
                    console.error('Erro test query API:', error);
                    alert('Erro test query: ' + error);
                  }
                }}
              >
                Test Query
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM - Gestão de Relacionamento</h1>
            <p className="text-muted-foreground">
              Gerencie o relacionamento com seus clientes
            </p>
          </div>
          <Dialog open={showNewOpportunityModal} onOpenChange={setShowNewOpportunityModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Oportunidade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Oportunidade</DialogTitle>
                <DialogDescription>
                  Crie uma nova oportunidade de venda rapidamente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newOpportunity.title}
                    onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                    placeholder="Ex: Venda de óculos de grau"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select value={newOpportunity.client_id} onValueChange={(value) => setNewOpportunity({...newOpportunity, client_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newOpportunity.value}
                    onChange={(e) => setNewOpportunity({...newOpportunity, value: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stage">Estágio</Label>
                  <Select value={newOpportunity.stage} onValueChange={(value) => setNewOpportunity({...newOpportunity, stage: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="proposal">Proposta</SelectItem>
                      <SelectItem value="negotiation">Negociação</SelectItem>
                      <SelectItem value="closed_won">Fechada (Ganha)</SelectItem>
                      <SelectItem value="closed_lost">Fechada (Perdida)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={newOpportunity.notes}
                    onChange={(e) => setNewOpportunity({...newOpportunity, notes: e.target.value})}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewOpportunityModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateOpportunity} disabled={!newOpportunity.title || !newOpportunity.client_id || !newOpportunity.value}>
                  Criar Oportunidade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="kanban">Pipeline de Oportunidades</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Carregando dados...</div>
            </div>
          ) : (
            <>
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
                    <p className="text-xs text-muted-foreground">
                      oportunidades ativas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      valor em oportunidades
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.conversionRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      oportunidades fechadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Atividades Recentes</CardTitle>
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{stats.recentActivities}</div>
                    <p className="text-xs text-muted-foreground">
                      últimos 7 dias
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição por Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Status</CardTitle>
                    <CardDescription>
                      Oportunidades organizadas por estágio do funil
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {Object.entries(stats.opportunitiesByStatus).map(([status, count]) => (
                        <div key={status} className="text-center p-4 border rounded-lg">
                          <div className={`text-2xl font-bold ${getStatusColor(status)}`}>
                            {count}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getStatusLabel(status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Atividades Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Atividades Recentes
                    </CardTitle>
                    <CardDescription>
                      Últimas atividades nas oportunidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.topOpportunities.slice(0, 3).map((opportunity) => (
                        <div key={opportunity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Target className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{opportunity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {opportunity.client_name} • {formatDate(opportunity.created_at)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getStatusColor(opportunity.status)}>
                                {getStatusLabel(opportunity.status)}
                              </Badge>
                              <span className="text-xs font-medium text-green-600">
                                R$ {(opportunity.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {reportData.topOpportunities.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma atividade recente</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Gerencie seus clientes e relacionamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, e-mail ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </div>

              {clientsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Carregando clientes...</div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Franquia</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">
                            {client.name}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {client.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-sm">{client.email}</span>
                                </div>
                              )}
                              {client.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span className="text-sm">{client.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {client.franchise_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {formatDate(client.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="mr-1 h-3 w-3" />
                                Ver
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Carregando relatórios...</div>
            </div>
          ) : (
            <>
              {/* Métricas de Performance */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {reportData.performanceMetrics.avgDealSize.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      valor médio por oportunidade
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {reportData.performanceMetrics.winRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      oportunidades ganhas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ciclo de Vendas</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {reportData.performanceMetrics.avgDealCycle} dias
                    </div>
                    <p className="text-xs text-muted-foreground">
                      tempo médio para fechar
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {reportData.performanceMetrics.totalClients}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      clientes cadastrados
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Receita Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Receita Mensal
                  </CardTitle>
                  <CardDescription>
                    Evolução da receita ao longo do ano
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-12 gap-2 h-32 items-end">
                    {reportData.monthlyRevenue.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-blue-500 rounded-t w-full"
                          style={{ 
                            height: `${Math.max(10, (item.value / Math.max(...reportData.monthlyRevenue.map(r => r.value))) * 100)}%` 
                          }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Receita total: R$ {reportData.monthlyRevenue.reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              {/* Top Oportunidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Oportunidades
                  </CardTitle>
                  <CardDescription>
                    Maiores oportunidades por valor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.topOpportunities.map((opportunity, index) => (
                      <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{opportunity.title}</p>
                            <p className="text-sm text-muted-foreground">{opportunity.client_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {(opportunity.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge variant="outline" className={getStatusColor(opportunity.status)}>
                            {getStatusLabel(opportunity.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Oportunidades (Kanban)</CardTitle>
              <CardDescription>
                Arraste e solte oportunidades entre os estágios do funil de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpportunityKanban />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRM;
