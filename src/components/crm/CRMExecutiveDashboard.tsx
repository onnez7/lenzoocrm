
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Award,
  Clock,
  BarChart3,
  PieChart
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CRMExecutiveDashboard() {
  const executiveMetrics = [
    {
      title: "Receita Anual",
      value: "R$ 2.4M",
      change: "+18.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      description: "vs ano anterior"
    },
    {
      title: "NPS Score",
      value: "73",
      change: "+5 pontos",
      trend: "up",
      icon: Award,
      color: "text-blue-600",
      description: "satisfação do cliente"
    },
    {
      title: "CAC",
      value: "R$ 285",
      change: "-12%",
      trend: "up",
      icon: Target,
      color: "text-purple-600",
      description: "custo de aquisição"
    },
    {
      title: "LTV",
      value: "R$ 4.2K",
      change: "+22%",
      trend: "up",
      icon: TrendingUp,
      color: "text-orange-600",
      description: "valor do cliente"
    },
    {
      title: "Churn Rate",
      value: "3.2%",
      change: "-0.8%",
      trend: "up",
      icon: Users,
      color: "text-red-600",
      description: "taxa de cancelamento"
    },
    {
      title: "Tempo p/ Fechamento",
      value: "18 dias",
      change: "-5 dias",
      trend: "up",
      icon: Clock,
      color: "text-indigo-600",
      description: "ciclo médio de vendas"
    }
  ];

  const salesTeamPerformance = [
    { name: "Maria Santos", revenue: 184000, deals: 23, conversion: 78, target: 200000 },
    { name: "Carlos Oliveira", revenue: 156000, deals: 19, conversion: 65, target: 180000 },
    { name: "Ana Costa", revenue: 142000, deals: 17, conversion: 71, target: 160000 },
    { name: "João Silva", revenue: 128000, deals: 15, conversion: 59, target: 150000 }
  ];

  const pipelineHealth = [
    { stage: "Prospecção", value: 450000, deals: 45, avgDays: 3 },
    { stage: "Qualificação", value: 320000, deals: 32, avgDays: 7 },
    { stage: "Proposta", value: 180000, deals: 18, avgDays: 12 },
    { stage: "Negociação", value: 95000, deals: 9, avgDays: 8 },
    { stage: "Fechamento", value: 42000, deals: 4, avgDays: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Executivas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {executiveMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs">
                  {metric.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {metric.change}
                  </span>
                  <span className="ml-1 text-muted-foreground">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance da Equipe</TabsTrigger>
          <TabsTrigger value="pipeline">Saúde do Pipeline</TabsTrigger>
          <TabsTrigger value="forecasting">Previsão de Vendas</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Individual da Equipe
              </CardTitle>
              <CardDescription>
                Análise detalhada do desempenho de cada vendedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {salesTeamPerformance.map((member) => (
                  <div key={member.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{member.deals} negócios</span>
                          <span>{member.conversion}% conversão</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          R$ {(member.revenue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Meta: R$ {(member.target / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progresso da Meta</span>
                        <span>{((member.revenue / member.target) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(member.revenue / member.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Análise de Saúde do Pipeline
              </CardTitle>
              <CardDescription>
                Distribuição e velocidade das oportunidades por estágio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineHealth.map((stage, index) => (
                  <div key={stage.stage} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{stage.stage}</h4>
                      <p className="text-sm text-muted-foreground">{stage.deals} oportunidades</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        R$ {(stage.value / 1000).toFixed(0)}K
                      </p>
                      <p className="text-sm text-muted-foreground">Valor total</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{stage.avgDays} dias</p>
                      <p className="text-sm text-muted-foreground">Tempo médio</p>
                    </div>
                    <div className="flex items-center">
                      <Progress 
                        value={((stage.deals / 45) * 100)} 
                        className="flex-1 h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Previsão Q1</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">R$ 580K</div>
                <p className="text-sm text-muted-foreground">85% de confiança</p>
                <Progress value={85} className="mt-2 h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meta Trimestral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">R$ 650K</div>
                <p className="text-sm text-muted-foreground">89% atingido</p>
                <Progress value={89} className="mt-2 h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gap de Meta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">R$ 70K</div>
                <p className="text-sm text-muted-foreground">Para atingir 100%</p>
                <Badge variant="outline" className="mt-2">11% restante</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
