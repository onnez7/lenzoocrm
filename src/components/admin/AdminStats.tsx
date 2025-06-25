
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Clock } from "lucide-react";

export function AdminStats() {
  const stats = [
    {
      title: "Total de Franqueados",
      value: "24",
      change: "+3 este mês",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "up"
    },
    {
      title: "Franqueados Ativos", 
      value: "22",
      change: "91.7% ativo",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "up"
    },
    {
      title: "Receita Mensal",
      value: "R$ 4.798,80",
      change: "+12% vs mês anterior",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      trend: "up"
    },
    {
      title: "Assinaturas Ativas",
      value: "22",
      change: "2 expirando em 7 dias",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "stable"
    },
    {
      title: "MRR (Receita Recorrente)",
      value: "R$ 4.798",
      change: "+14% crescimento",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "up"
    },
    {
      title: "Tickets Abertos",
      value: "7",
      change: "3 alta prioridade",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      trend: "down"
    },
    {
      title: "Uso Médio do Sistema",
      value: "73%",
      change: "dos limites do plano",
      icon: Building2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      trend: "stable"
    },
    {
      title: "Tempo Médio de Resposta",
      value: "2.4h",
      change: "suporte técnico",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "up"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
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
