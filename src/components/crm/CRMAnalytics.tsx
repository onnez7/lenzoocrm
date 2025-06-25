
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign,
  Calendar,
  Phone,
  Mail
} from "lucide-react";

export function CRMAnalytics() {
  const metrics = [
    {
      title: "Taxa de Conversão",
      value: "24.8%",
      change: "+2.3%",
      trend: "up",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Ciclo de Vendas Médio",
      value: "32 dias",
      change: "-3 dias",
      trend: "up",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Leads Qualificados",
      value: "156",
      change: "+23",
      trend: "up",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Revenue Pipeline",
      value: "R$ 127.5k",
      change: "+15.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    }
  ];

  const activities = [
    { type: "call", count: 45, label: "Ligações", icon: Phone, percentage: 65 },
    { type: "email", count: 123, label: "E-mails", icon: Mail, percentage: 85 },
    { type: "meeting", count: 28, label: "Reuniões", icon: Calendar, percentage: 45 },
    { type: "task", count: 67, label: "Tarefas", icon: Target, percentage: 75 }
  ];

  const conversionFunnel = [
    { stage: "Visitantes", value: 2450, percentage: 100 },
    { stage: "Leads", value: 486, percentage: 20 },
    { stage: "Qualificados", value: 156, percentage: 6.4 },
    { stage: "Oportunidades", value: 89, percentage: 3.6 },
    { stage: "Fechados", value: 22, percentage: 0.9 }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {metric.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {metric.change}
                  </span>
                  <span className="ml-1">vs mês anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Funil de Conversão */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>
              Análise do pipeline de vendas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.value.toLocaleString()} ({stage.percentage}%)
                  </span>
                </div>
                <Progress value={stage.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Atividades de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades de Vendas</CardTitle>
            <CardDescription>
              Progresso das atividades desta semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{activity.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {activity.count}
                    </span>
                  </div>
                  <Progress value={activity.percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
