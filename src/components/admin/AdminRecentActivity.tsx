
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertTriangle, Bell, CreditCard, UserPlus } from "lucide-react";

const recentActivities = [
  {
    id: '1',
    type: 'new_franchisee',
    title: 'Novo Franqueado',
    description: '"Ótica Premium" completou o cadastro e ativou o plano Premium',
    time: '2 horas atrás',
    status: 'success',
    icon: UserPlus,
    details: 'Plano Premium - R$ 199,90/mês'
  },
  {
    id: '2',
    type: 'payment_received',
    title: 'Pagamento Recebido',
    description: '"Ótica Visão Clara" - Mensalidade de Junho processada',
    time: '4 horas atrás',
    status: 'success',
    icon: CreditCard,
    details: 'R$ 199,90 via cartão'
  },
  {
    id: '3',
    type: 'upgrade_plan',
    title: 'Upgrade de Plano',
    description: '"Ótica Central" migrou do Básico para Premium',
    time: '6 horas atrás',
    status: 'success',
    icon: TrendingUp,
    details: '+R$ 100,00 MRR'
  },
  {
    id: '4',
    type: 'support_ticket',
    title: 'Ticket de Suporte',
    description: '"Ótica Moderna" relatou problema na sincronização',
    time: '8 horas atrás',
    status: 'warning',
    icon: AlertTriangle,
    details: 'Prioridade: Alta'
  },
  {
    id: '5',
    type: 'trial_started',
    title: 'Trial Iniciado',
    description: '"Óticas do Norte" começou período de teste',
    time: '1 dia atrás',
    status: 'info',
    icon: Bell,
    details: '14 dias restantes'
  }
];

export function AdminRecentActivity() {
  const getActivityIcon = (type: string) => {
    const iconMap = {
      new_franchisee: UserPlus,
      payment_received: CreditCard,
      upgrade_plan: TrendingUp,
      support_ticket: AlertTriangle,
      trial_started: Bell
    };
    return iconMap[type as keyof typeof iconMap] || Bell;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      info: 'outline',
      error: 'destructive'
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Últimas ações e eventos importantes do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                    <Badge variant={getStatusBadge(activity.status) as any} className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <p className="text-xs font-medium text-gray-700">{activity.details}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
