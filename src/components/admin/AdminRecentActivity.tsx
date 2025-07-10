import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertTriangle, Bell, CreditCard, UserPlus, ShoppingCart, Package } from "lucide-react";
import adminService from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  type: 'sale' | 'user' | 'product';
  id: number;
  title: string;
  description: string;
  user: string;
  date: string;
  amount?: number;
}

export function AdminRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await adminService.getRecentActivity();
        setActivities(data);
      } catch (error) {
        console.error('Erro ao buscar atividades:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as atividades recentes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [toast]);

  const getActivityIcon = (type: string) => {
    const iconMap = {
      sale: ShoppingCart,
      user: UserPlus,
      product: Package
    };
    return iconMap[type as keyof typeof iconMap] || Bell;
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-600 bg-green-100';
      case 'user': return 'text-blue-600 bg-blue-100';
      case 'product': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (type: string) => {
    const variants = {
      sale: 'default',
      user: 'secondary',
      product: 'outline'
    };
    return variants[type as keyof typeof variants] || 'outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours} hora(s) atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dia(s) atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-3">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Últimas vendas, usuários e produtos criados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="mx-auto h-8 w-8 mb-2" />
              <p>Nenhuma atividade recente</p>
            </div>
          ) : (
            activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${getStatusColor(activity.type)}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <Badge variant={getStatusBadge(activity.type) as any} className="text-xs">
                        {activity.type === 'sale' ? 'Venda' : activity.type === 'user' ? 'Usuário' : 'Produto'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                      <p className="text-xs font-medium text-gray-700">
                        {activity.amount ? `R$ ${activity.amount.toFixed(2)}` : activity.user}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
