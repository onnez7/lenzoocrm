
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Star } from "lucide-react";

const topPerformers = [
  {
    id: '1',
    name: 'Ótica Visão Clara',
    revenue: 890.50,
    growth: 24,
    plan: 'premium',
    status: 'active',
    satisfaction: 98
  },
  {
    id: '2', 
    name: 'Óticas Premium',
    revenue: 756.30,
    growth: 18,
    plan: 'enterprise',
    status: 'active',
    satisfaction: 95
  },
  {
    id: '3',
    name: 'Ótica Central',
    revenue: 645.80,
    growth: 31,
    plan: 'premium',
    status: 'active',
    satisfaction: 92
  },
  {
    id: '4',
    name: 'Visão Moderna',
    revenue: 534.20,
    growth: 12,
    plan: 'basic',
    status: 'active',
    satisfaction: 88
  }
];

export function AdminTopPerformers() {
  const getPlanBadge = (plan: string) => {
    const styles = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800", 
      enterprise: "bg-gray-100 text-gray-800"
    };
    return styles[plan as keyof typeof styles];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Performers
        </CardTitle>
        <CardDescription>
          Franqueados com melhor desempenho este mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.map((performer, index) => (
            <div key={performer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{performer.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getPlanBadge(performer.plan)}>
                      {performer.plan}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">{performer.satisfaction}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">R$ {performer.revenue.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+{performer.growth}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Performance Média Geral</p>
            <Progress value={87} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">87% acima da meta</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
