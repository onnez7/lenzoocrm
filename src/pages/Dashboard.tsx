import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Package,
  Clock,
  AlertCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const salesData = [
  { month: "Jan", sales: 12000, orders: 45 },
  { month: "Fev", sales: 15000, orders: 52 },
  { month: "Mar", sales: 18000, orders: 61 },
  { month: "Abr", sales: 14000, orders: 48 },
  { month: "Mai", sales: 22000, orders: 75 },
  { month: "Jun", sales: 25000, orders: 82 },
];

const categoryData = [
  { name: "Óculos de Grau", value: 45, fill: "#193cb8" },
  { name: "Óculos de Sol", value: 30, fill: "#1447e6" },
  { name: "Lentes de Contato", value: 15, fill: "#155dfc" },
  { name: "Acessórios", value: 10, fill: "#2b7fff" },
];

const recentAppointments = [
  { id: 1, client: "Maria Silva", time: "09:00", type: "Consulta", status: "confirmado" },
  { id: 2, client: "João Santos", time: "10:30", type: "Retirada", status: "pendente" },
  { id: 3, client: "Ana Costa", time: "14:00", type: "Exame", status: "confirmado" },
  { id: 4, client: "Pedro Lima", time: "15:30", type: "Ajuste", status: "atrasado" },
];

const lowStockProducts = [
  { name: "Lente Transitions", current: 5, min: 10 },
  { name: "Armação Ray-Ban", current: 2, min: 5 },
  { name: "Lente Antirreflexo", current: 8, min: 15 },
];

const salesConfig = {
  orders: {
    label: "orders",
    color: "var(--chart-1)",
  },
};


const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 25.430</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              para hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Mensais</CardTitle>
            <CardDescription>
              Evolução das vendas nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart accessibilityLayer data={salesData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'sales' ? `R$ ${value.toLocaleString()}` : value,
                      name === 'sales' ? 'Vendas' : 'Pedidos'
                    ]}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das vendas por tipo de produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agendamentos de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamentos de Hoje
            </CardTitle>
            <CardDescription>
              Próximos compromissos agendados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{appointment.time}</span>
                    </div>
                    <div>
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      appointment.status === 'confirmado' ? 'default' :
                      appointment.status === 'pendente' ? 'secondary' : 'destructive'
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              Ver Todos os Agendamentos
            </Button>
          </CardContent>
        </Card>

        {/* Produtos com Estoque Baixo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Estoque Baixo
            </CardTitle>
            <CardDescription>
              Produtos que precisam de reposição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Estoque atual: {product.current} | Mínimo: {product.min}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Baixo
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Gerenciar Estoque
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              Novo Cliente
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <ShoppingBag className="h-6 w-6" />
              Nova Venda
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Calendar className="h-6 w-6" />
              Agendar
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Package className="h-6 w-6" />
              Estoque
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
