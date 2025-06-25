
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CreditCard,
  AlertTriangle,
  Target,
  BarChart3
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const monthlyRevenue = [
  { month: 'Jul', receita: 3200, despesas: 800, mrr: 2800 },
  { month: 'Ago', receita: 3800, despesas: 900, mrr: 3200 },
  { month: 'Set', receita: 4200, despesas: 950, mrr: 3600 },
  { month: 'Out', receita: 4600, despesas: 1000, mrr: 4200 },
  { month: 'Nov', receita: 4800, despesas: 1100, mrr: 4798 },
  { month: 'Dez', receita: 5200, despesas: 1200, mrr: 5100 },
];

const revenueByPlan = [
  { plan: 'Básico', receita: 1797.30, clientes: 18, percentual: 37.4 },
  { plan: 'Premium', receita: 2398.40, clientes: 12, percentual: 50.0 },
  { plan: 'Enterprise', receita: 599.10, clientes: 1, percentual: 12.6 },
];

export function AdminFinanceOverview() {
  const totalMRR = 4798.80;
  const previousMRR = 4200.00;
  const mrrGrowth = ((totalMRR - previousMRR) / previousMRR * 100).toFixed(1);
  
  const churnRate = 2.3;
  const averageRevenue = totalMRR / 31; // 31 clientes ativos
  
  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalMRR.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{mrrGrowth}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR Projetado</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {(totalMRR * 12).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita anual recorrente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {averageRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita média por usuário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {churnRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de cancelamento mensal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
            <CardDescription>MRR e crescimento mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="MRR"
                />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Receita Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Plano</CardTitle>
            <CardDescription>Distribuição da receita por tipo de plano</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                />
                <Bar dataKey="receita" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada por Plano</CardTitle>
          <CardDescription>Performance e métricas por tipo de assinatura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueByPlan.map((plan, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    plan.plan === 'Básico' ? 'bg-blue-500' :
                    plan.plan === 'Premium' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium">Plano {plan.plan}</h4>
                    <p className="text-sm text-gray-500">{plan.clientes} clientes ativos</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    R$ {plan.receita.toFixed(2)}
                  </div>
                  <Badge variant="outline">
                    {plan.percentual}% do total
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
