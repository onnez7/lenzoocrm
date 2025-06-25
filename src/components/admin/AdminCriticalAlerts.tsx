
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Users, Clock, ExternalLink } from "lucide-react";

const criticalAlerts = [
  {
    id: '1',
    type: 'payment_overdue',
    title: 'Pagamentos em Atraso',
    description: '3 franqueados com pagamentos pendentes há mais de 7 dias',
    severity: 'high',
    count: 3,
    action: 'Ver detalhes',
    icon: CreditCard,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: '2',
    type: 'trial_expiring',
    title: 'Trials Expirando',
    description: '2 franqueados com trial expirando em 48h',
    severity: 'medium',
    count: 2,
    action: 'Acompanhar',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    id: '3',
    type: 'high_usage',
    title: 'Uso Elevado',
    description: '4 franqueados próximos do limite do plano',
    severity: 'medium',
    count: 4,
    action: 'Upgrade',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    id: '4',
    type: 'support_urgent',
    title: 'Tickets Urgentes',
    description: '2 tickets críticos aguardando resposta',
    severity: 'high',
    count: 2,
    action: 'Responder',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
];

export function AdminCriticalAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Alertas Críticos
          <Badge variant="destructive" className="ml-auto">
            {criticalAlerts.filter(alert => alert.severity === 'high').length} Urgentes
          </Badge>
        </CardTitle>
        <CardDescription>
          Itens que precisam de atenção imediata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criticalAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alert.bgColor} ${alert.borderColor}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <alert.icon className={`h-5 w-5 mt-0.5 ${alert.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {alert.count}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="ml-2">
                  {alert.action}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <Button variant="outline" className="w-full">
            Ver Todos os Alertas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
