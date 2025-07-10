import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Clock, Package, ShoppingCart } from "lucide-react";
import adminService, { AdminStats as AdminStatsType } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

export function AdminStats() {
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
          description: "Não foi possível carregar as estatísticas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Erro ao carregar estatísticas</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total de Franquias",
      value: stats.totalFranchises.toString(),
      change: `${stats.activeFranchises} ativas`,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "up"
    },
    {
      title: "Franquias Ativas", 
      value: stats.activeFranchises.toString(),
      change: `${((stats.activeFranchises / stats.totalFranchises) * 100).toFixed(1)}% ativo`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "up"
    },
    {
      title: "Total de Usuários",
      value: stats.totalUsers.toString(),
      change: "usuários cadastrados",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      trend: "stable"
    },
    {
      title: "Total de Produtos",
      value: stats.totalProducts.toString(),
      change: "produtos cadastrados",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "stable"
    },
    {
      title: "Total de Vendas",
      value: stats.totalSales.toString(),
      change: "vendas realizadas",
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      trend: "up"
    },
    {
      title: "Receita Total",
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      change: "receita acumulada",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "up"
    },
    {
      title: "Receita Mensal",
      value: `R$ ${stats.monthlyRevenue.toFixed(2)}`,
      change: "este mês",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      trend: "up"
    },
    {
      title: "Contas Pendentes",
      value: `${stats.pendingReceivables > 0 || stats.pendingPayables > 0 ? 'Sim' : 'Não'}`,
      change: `R$ ${(stats.pendingReceivables + stats.pendingPayables).toFixed(2)}`,
      icon: AlertTriangle,
      color: stats.pendingReceivables > 0 || stats.pendingPayables > 0 ? "text-red-600" : "text-green-600",
      bgColor: stats.pendingReceivables > 0 || stats.pendingPayables > 0 ? "bg-red-100" : "bg-green-100",
      trend: stats.pendingReceivables > 0 || stats.pendingPayables > 0 ? "down" : "up"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <p className={`text-xs flex items-center gap-1 ${
              stat.trend === 'up' ? 'text-green-600' : 
              stat.trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
