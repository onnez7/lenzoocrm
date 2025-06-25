
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Database, Zap } from "lucide-react";

export default function AdminUsage() {
  const mockMetrics = [
    {
      title: "Total de Usuários",
      value: "245",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Storage Utilizado",
      value: "2.3 GB",
      change: "+5%",
      icon: Database,
      color: "text-green-600",
    },
    {
      title: "API Calls (30d)",
      value: "125K",
      change: "+18%",
      icon: Zap,
      color: "text-purple-600",
    },
    {
      title: "Uptime",
      value: "99.9%",
      change: "0%",
      icon: BarChart3,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Uso & Métricas</h1>
        <p className="text-gray-600 mt-2">Monitoramento de uso do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {metric.change} vs mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uso por Tenant</CardTitle>
          <CardDescription>Métricas detalhadas por inquilino</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Gráficos de uso serão implementados aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
