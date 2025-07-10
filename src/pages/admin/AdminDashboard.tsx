import { useEffect, useState } from "react";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart";
import { AdminFranchiseesMap } from "@/components/admin/AdminFranchiseesMap";
import { AdminTopPerformers } from "@/components/admin/AdminTopPerformers";
import { AdminCriticalAlerts } from "@/components/admin/AdminCriticalAlerts";
import { AdminRecentActivity } from "@/components/admin/AdminRecentActivity";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp, Users, AlertTriangle, Download, Filter, BarChart3 } from "lucide-react";
import adminService, { AdminStats as AdminStatsType } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as estatísticas do dashboard",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const systemHealth = {
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '45ms',
    lastIncident: '3 dias atrás'
  };

  const todayHighlights = [
    { 
      label: 'Franquias Ativas', 
      value: stats?.activeFranchises?.toString() || '0', 
      trend: `${stats?.totalFranchises ? ((stats.activeFranchises / stats.totalFranchises) * 100).toFixed(1) : 0}% ativo` 
    },
    { 
      label: 'Receita Mensal', 
      value: `R$ ${stats?.monthlyRevenue?.toFixed(2) || '0,00'}`, 
      trend: '+23%' 
    },
    { 
      label: 'Total de Vendas', 
      value: stats?.totalSales?.toString() || '0', 
      trend: 'vendas realizadas' 
    },
    { 
      label: 'Contas Pendentes', 
      value: stats?.pendingReceivables > 0 || stats?.pendingPayables > 0 ? 'Sim' : 'Não', 
      trend: `R$ ${((stats?.pendingReceivables || 0) + (stats?.pendingPayables || 0)).toFixed(2)}` 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600 mt-1">Controle total do sistema Lenzoo - Franqueados & Performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" className="relative">
            <Bell className="mr-2 h-4 w-4" />
            Alertas
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
              {stats ? (stats.pendingReceivables > 0 || stats.pendingPayables > 0 ? '1' : '0') : '0'}
            </Badge>
          </Button>
        </div>
      </div>

      {/* System Health & Today's Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-lg font-bold text-green-800">Operacional</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Uptime: {systemHealth.uptime}</p>
          </CardContent>
        </Card>
        
        {todayHighlights.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{item.value}</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {item.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Stats */}
      <AdminStats />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="franchisees">Franqueados</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminRevenueChart />
            <AdminCriticalAlerts />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdminRecentActivity />
            </div>
            <AdminTopPerformers />
          </div>
        </TabsContent>

        <TabsContent value="franchisees">
          <AdminFranchiseesMap />
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Análise Financeira Detalhada</CardTitle>
              <CardDescription>Receitas, custos e projeções por franqueado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                <p>Módulo financeiro em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>KPIs e benchmarks por franqueado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                <p>Dashboard de performance em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Central de Suporte</CardTitle>
              <CardDescription>Tickets, SLA e satisfação do cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>Central de suporte em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <AdminQuickActions />
    </div>
  );
}
