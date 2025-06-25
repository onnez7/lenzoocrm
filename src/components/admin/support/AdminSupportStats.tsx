
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  TrendingUp 
} from "lucide-react";

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgress: number;
  resolved: number;
  avgResponseTime: string;
  satisfaction: number;
}

interface AdminSupportStatsProps {
  stats: SupportStats;
}

export function AdminSupportStats({ stats }: AdminSupportStatsProps) {
  const statCards = [
    {
      title: "Total de Tickets",
      value: stats.totalTickets.toString(),
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+8 esta semana"
    },
    {
      title: "Tickets Abertos",
      value: stats.openTickets.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "3 alta prioridade"
    },
    {
      title: "Em Andamento",
      value: stats.inProgress.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "Sendo resolvidos"
    },
    {
      title: "Resolvidos",
      value: stats.resolved.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "Esta semana: 15"
    },
    {
      title: "Tempo de Resposta",
      value: stats.avgResponseTime,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "Média geral"
    },
    {
      title: "Satisfação",
      value: `${stats.satisfaction}/5`,
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "Avaliação média"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
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
            <p className="text-xs text-gray-500">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
