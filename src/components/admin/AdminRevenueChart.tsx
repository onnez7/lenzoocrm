import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import adminService, { RevenueData } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

export function AdminRevenueChart() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenue, adminStats] = await Promise.all([
          adminService.getRevenueData(),
          adminService.getAdminStats()
        ]);
        setRevenueData(revenue);
        setStats(adminStats);
      } catch (error) {
        console.error('Erro ao buscar dados de receita:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados de receita",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const currentRevenue = revenueData.length > 0 ? revenueData[revenueData.length - 1]?.revenue || 0 : 0;
  const previousRevenue = revenueData.length > 1 ? revenueData[revenueData.length - 2]?.revenue || 0 : 0;
  const growthPercentage = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const averageTicket = stats?.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Receita Mensal & Crescimento
          <span className={`text-sm font-normal px-2 py-1 rounded ${
            growthPercentage >= 0 
              ? 'text-green-600 bg-green-100' 
              : 'text-red-600 bg-red-100'
          }`}>
            {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}% vs último mês
          </span>
        </CardTitle>
        <CardDescription>
          Evolução da receita e número de franquias ativas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `R$ ${Number(value).toFixed(2)}` : value,
                  name === 'revenue' ? 'Receita' : 'Franquias'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="franchises" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              R$ {currentRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Receita Atual</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats?.totalFranchises || 0}
            </p>
            <p className="text-xs text-gray-500">Franquias</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              R$ {averageTicket.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Ticket Médio</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
