import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Users, Clock, ExternalLink, Building2, Package } from "lucide-react";
import adminService from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  type: 'warning' | 'danger';
  title: string;
  description: string;
  count: number;
  amount?: number;
  data?: any[];
}

export function AdminCriticalAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await adminService.getCriticalAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Erro ao buscar alertas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os alertas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [toast]);

  const getAlertIcon = (title: string) => {
    if (title.includes('Franquias')) return Building2;
    if (title.includes('Receber')) return CreditCard;
    if (title.includes('Pagar')) return CreditCard;
    if (title.includes('Estoque')) return Package;
    return AlertTriangle;
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getActionText = (title: string) => {
    if (title.includes('Franquias')) return 'Ver Franquias';
    if (title.includes('Receber')) return 'Ver Contas';
    if (title.includes('Pagar')) return 'Ver Contas';
    if (title.includes('Estoque')) return 'Ver Produtos';
    return 'Ver Detalhes';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border-l-4 bg-gray-50 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const urgentAlerts = alerts.filter(alert => alert.type === 'danger');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Alertas Críticos
          {urgentAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {urgentAlerts.length} Urgentes
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Itens que precisam de atenção imediata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <p>Nenhum alerta crítico</p>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const IconComponent = getAlertIcon(alert.title);
              const colors = getAlertColors(alert.type);
              
              return (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${colors.bgColor} ${colors.borderColor}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${colors.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.count}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        {alert.amount && (
                          <p className="text-sm font-medium text-gray-700 mt-1">
                            Total: R$ {alert.amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2">
                      {getActionText(alert.title)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {alerts.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" className="w-full">
              Ver Todos os Alertas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
