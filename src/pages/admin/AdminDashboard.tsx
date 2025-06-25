
import { AdminStats } from "@/components/admin/AdminStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Users, AlertTriangle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const recentActivities = [
    {
      id: '1',
      type: 'new_tenant',
      message: 'Novo inquilino "Ótica Premium" se registrou',
      time: '2 horas atrás',
      status: 'success'
    },
    {
      id: '2',
      type: 'payment_received',
      message: 'Pagamento recebido de "Ótica Visão Clara" - R$ 199,90',
      time: '4 horas atrás',
      status: 'success'
    },
    {
      id: '3',
      type: 'support_ticket',
      message: 'Novo ticket de suporte: "Problema na sincronização"',
      time: '6 horas atrás',
      status: 'warning'
    },
    {
      id: '4',
      type: 'subscription_expiring',
      message: 'Assinatura de "Ótica Moderna" expira em 3 dias',
      time: '1 dia atrás',
      status: 'warning'
    }
  ];

  const criticalAlerts = [
    {
      id: '1',
      title: 'Pagamento em Atraso',
      description: '2 Franqueandos com pagamentos pendentes há mais de 5 dias',
      severity: 'high',
      count: 2
    },
    {
      id: '2',
      title: 'Tickets Urgentes',
      description: 'Tickets de alta prioridade aguardando resposta',
      severity: 'medium',
      count: 3
    },
    {
      id: '3',
      title: 'Uso Elevado',
      description: 'Franqueandos próximos do limite do plano',
      severity: 'low',
      count: 4
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_tenant': return <Users className="h-4 w-4" />;
      case 'payment_received': return <TrendingUp className="h-4 w-4" />;
      case 'support_ticket': return <AlertTriangle className="h-4 w-4" />;
      case 'subscription_expiring': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema Lenzoo SaaS</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Notificações
          </Button>
          <Button>Gerar Relatório</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas ações e eventos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Alertas Críticos</CardTitle>
              <CardDescription>Itens que precisam de atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalAlerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {alert.count}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-90">{alert.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Novo Inquilino</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Relatório Financeiro</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <AlertTriangle className="h-6 w-6 mb-2" />
              <span className="text-sm">Ver Tickets</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Bell className="h-6 w-6 mb-2" />
              <span className="text-sm">Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
