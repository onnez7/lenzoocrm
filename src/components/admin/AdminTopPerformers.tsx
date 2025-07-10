import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Star, Users, Package } from "lucide-react";
import adminService from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

interface TopPerformer {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  users: number;
  products: number;
}

export function AdminTopPerformers() {
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        const data = await adminService.getTopPerformers();
        setPerformers(data);
      } catch (error) {
        console.error('Erro ao buscar top performers:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os top performers",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = performers.reduce((sum, p) => sum + p.revenue, 0);
  const averageRevenue = performers.length > 0 ? totalRevenue / performers.length : 0;
  const performancePercentage = performers.length > 0 ? Math.min(100, (averageRevenue / 1000) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Performers
        </CardTitle>
        <CardDescription>
          Franquias com melhor desempenho em vendas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="mx-auto h-8 w-8 mb-2" />
              <p>Nenhum dado disponível</p>
            </div>
          ) : (
            performers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{performer.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="h-3 w-3" />
                        <span>{performer.users}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Package className="h-3 w-3" />
                        <span>{performer.products}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{performer.sales} vendas</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">R$ {performer.revenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{performer.sales} vendas</p>
                </div>
              </div>
            ))
          )}
        </div>
        {performers.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Receita Média por Franquia</p>
              <Progress value={performancePercentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                R$ {averageRevenue.toFixed(2)} média
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
