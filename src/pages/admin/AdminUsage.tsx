import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  Users, 
  Database, 
  Zap, 
  HardDrive,
  Activity,
  Wifi,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const systemMetrics = [
  {
    title: "Total de Usuários",
    value: "247",
    change: "+12%",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    limit: 500,
    usage: 247
  },
  {
    title: "Storage Utilizado",
    value: "2.8 GB",
    change: "+15%",
    icon: Database,
    color: "text-green-600",
    bgColor: "bg-green-100",
    limit: 10,
    usage: 2.8
  },
  {
    title: "API Calls (30d)",
    value: "142K",
    change: "+28%",
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    limit: 500000,
    usage: 142000
  },
  {
    title: "Bandwidth",
    value: "85.4 GB",
    change: "+8%",
    icon: Wifi,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    limit: 200,
    usage: 85.4
  }
];

const tenantUsageData = [
  {
    tenant: "Ótica Visão Clara",
    plan: "Premium",
    users: 8,
    maxUsers: 10,
    storage: 340,
    maxStorage: 1000,
    apiCalls: 15500,
    maxApiCalls: 50000,
    status: "healthy"
  },
  {
    tenant: "Ótica Moderna",
    plan: "Básico",
    users: 2,
    maxUsers: 3,
    storage: 180,
    maxStorage: 500,
    apiCalls: 5200,
    maxApiCalls: 10000,
    status: "healthy"
  },
  {
    tenant: "Ótica Central",
    plan: "Premium",
    users: 9,
    maxUsers: 10,
    storage: 780,
    maxStorage: 1000,
    apiCalls: 28000,
    maxApiCalls: 50000,
    status: "warning"
  },
  {
    tenant: "Ótica Vista Bela",
    plan: "Enterprise",
    users: 15,
    maxUsers: -1,
    storage: 1200,
    maxStorage: -1,
    apiCalls: 45000,
    maxApiCalls: -1,
    status: "healthy"
  }
];

const weeklyUsage = [
  { day: 'Seg', usuarios: 220, apiCalls: 18000, storage: 2.4 },
  { day: 'Ter', usuarios: 235, apiCalls: 22000, storage: 2.5 },
  { day: 'Qua', usuarios: 242, apiCalls: 25000, storage: 2.6 },
  { day: 'Qui', usuarios: 245, apiCalls: 28000, storage: 2.7 },
  { day: 'Sex', usuarios: 247, apiCalls: 30000, storage: 2.8 },
  { day: 'Sáb', usuarios: 210, apiCalls: 15000, storage: 2.8 },
  { day: 'Dom', usuarios: 195, apiCalls: 12000, storage: 2.8 }
];

const usageByPlan = [
  { plan: 'Básico', usage: 35, color: '#8884d8' },
  { plan: 'Premium', usage: 45, color: '#82ca9d' },
  { plan: 'Enterprise', usage: 20, color: '#ffc658' }
];

export default function AdminUsage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Saudável</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0; // Ilimitado
    return (current / max) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Uso & Métricas do Sistema</h1>
          <p className="text-gray-600 mt-1">Monitoramento de recursos e performance em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 dias</SelectItem>
              <SelectItem value="30days">30 dias</SelectItem>
              <SelectItem value="90days">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => {
          const usagePercentage = metric.title === "Storage Utilizado" 
            ? (metric.usage / metric.limit) * 100
            : metric.title === "Total de Usuários"
            ? (metric.usage / metric.limit) * 100
            : metric.title === "API Calls (30d)"
            ? (metric.usage / metric.limit) * 100
            : (metric.usage / metric.limit) * 100;

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="space-y-2">
                  <Progress value={usagePercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className={getUsageColor(usagePercentage)}>
                      {usagePercentage.toFixed(1)}% usado
                    </span>
                    <span>{metric.change} vs mês anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tenants">Por Franqueado</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Gráfico de Uso Semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Uso - Última Semana</CardTitle>
              <CardDescription>Evolução das principais métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="usuarios" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Usuários Ativos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="apiCalls" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="API Calls (k)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uso por Plano */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Uso por Plano</CardTitle>
                <CardDescription>Percentual de uso por tipo de plano</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={usageByPlan}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ plan, usage }) => `${plan}: ${usage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                    >
                      {usageByPlan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recursos Mais Utilizados */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos Mais Utilizados</CardTitle>
                <CardDescription>Top recursos por consumo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Gestão de Clientes</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">45.2K calls</div>
                      <Progress value={85} className="w-20 h-2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Relatórios</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">32.1K calls</div>
                      <Progress value={65} className="w-20 h-2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Autenticação</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">28.8K calls</div>
                      <Progress value={55} className="w-20 h-2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">Backup</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">15.3K calls</div>
                      <Progress value={30} className="w-20 h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uso por Franqueado</CardTitle>
              <CardDescription>Consumo de recursos individual por conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenantUsageData.map((tenant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{tenant.tenant}</h4>
                          <p className="text-sm text-gray-500">Plano {tenant.plan}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(tenant.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Usuários */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Usuários
                          </span>
                          <span className="text-sm">
                            {tenant.users}/{tenant.maxUsers === -1 ? '∞' : tenant.maxUsers}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(tenant.users, tenant.maxUsers)} 
                          className="h-2" 
                        />
                      </div>
                      
                      {/* Storage */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            Storage
                          </span>
                          <span className="text-sm">
                            {tenant.storage}MB/{tenant.maxStorage === -1 ? '∞' : `${tenant.maxStorage}MB`}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(tenant.storage, tenant.maxStorage)} 
                          className="h-2" 
                        />
                      </div>
                      
                      {/* API Calls */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            API Calls
                          </span>
                          <span className="text-sm">
                            {(tenant.apiCalls/1000).toFixed(1)}K/{tenant.maxApiCalls === -1 ? '∞' : `${tenant.maxApiCalls/1000}K`}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(tenant.apiCalls, tenant.maxApiCalls)} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance do Sistema</CardTitle>
                <CardDescription>Métricas de uptime e resposta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span>Uptime</span>
                  </div>
                  <span className="font-bold text-green-600">99.97%</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>Tempo de Resposta Médio</span>
                  </div>
                  <span className="font-bold">142ms</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-600" />
                    <span>Query Performance</span>
                  </div>
                  <span className="font-bold">28ms</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-orange-600" />
                    <span>I/O Operations</span>
                  </div>
                  <span className="font-bold">1.2K/s</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos do Servidor</CardTitle>
                <CardDescription>Utilização de hardware em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>RAM</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disco</span>
                    <span>34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network I/O</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertas de Uso
              </CardTitle>
              <CardDescription>Franqueados próximos dos limites de uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                  <div>
                    <h4 className="font-medium">Ótica Central</h4>
                    <p className="text-sm text-gray-600">Usuários: 9/10 (90% do limite)</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border-l-4 border-orange-500 bg-orange-50 rounded">
                  <div>
                    <h4 className="font-medium">Ótica Central</h4>
                    <p className="text-sm text-gray-600">Storage: 780MB/1GB (78% do limite)</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Moderado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <div>
                    <h4 className="font-medium">Sistema Global</h4>
                    <p className="text-sm text-gray-600">API Calls aumentaram 28% este mês</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Info</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuração de Alertas</CardTitle>
              <CardDescription>Configure limites para receber notificações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Alerta de Usuários (%)</label>
                    <input 
                      type="number" 
                      defaultValue="85" 
                      className="w-full p-2 border rounded mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alerta de Storage (%)</label>
                    <input 
                      type="number" 
                      defaultValue="80" 
                      className="w-full p-2 border rounded mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alerta de API Calls (%)</label>
                    <input 
                      type="number" 
                      defaultValue="75" 
                      className="w-full p-2 border rounded mt-1"
                    />
                  </div>
                </div>
                <Button>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
