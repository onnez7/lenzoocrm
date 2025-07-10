import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  FileText,
  Download,
  Users,
  ShoppingCart,
  CreditCard,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { api } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

interface FinancialData {
  totalReceivables: number;
  totalPayables: number;
  totalSales: number;
  totalSalaries: number;
  totalSangrias: number;
  netProfit: number;
  monthlyData: any[];
  paymentMethods: any[];
  categoryData: any[];
}

interface PaymentHistory {
  id: number;
  description: string;
  amount: number;
  type: 'receivable' | 'payable' | 'salary' | 'sangria';
  date: string;
  status: string;
  payment_method: string;
  category: string;
}

const FinanceReports = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [dateFilter, setDateFilter] = useState('6months');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFinancialData();
  }, [dateFilter]);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados financeiros
      const [financeStatsRes, monthlyRes, categoriesRes, paymentMethodsRes] = await Promise.all([
        api.get('/finance/stats'),
        api.get('/finance/monthly'),
        api.get('/finance/categories'),
        api.get('/finance/payment-methods')
      ]);

      const financeStats = financeStatsRes.data;
      const monthlyData = monthlyRes.data;
      const categories = categoriesRes.data;
      const paymentMethods = paymentMethodsRes.data;

      // Preparar dados para o componente
      const categoryData = [
        ...categories.receivables.map((cat: any) => ({
          name: cat.category,
          value: Math.round((cat.total_amount / financeStats.summary.totalReceitas) * 100),
          color: '#8884d8'
        })),
        ...categories.payables.map((cat: any) => ({
          name: cat.category,
          value: Math.round((cat.total_amount / financeStats.summary.totalDespesas) * 100),
          color: '#ff7c7c'
        }))
      ];

      const paymentMethodsData = [
        ...paymentMethods.receivables.map((method: any) => ({
          method: method.payment_method,
          percentage: Math.round((method.total_amount / financeStats.summary.totalReceitas) * 100),
          amount: method.total_amount
        })),
        ...paymentMethods.payables.map((method: any) => ({
          method: method.payment_method,
          percentage: Math.round((method.total_amount / financeStats.summary.totalDespesas) * 100),
          amount: method.total_amount
        }))
      ];

      setFinancialData({
        totalReceivables: financeStats.summary.totalReceitas,
        totalPayables: financeStats.summary.totalDespesas,
        totalSales: financeStats.sales.completed_amount || 0,
        totalSalaries: financeStats.salaries.total_salaries || 0,
        totalSangrias: financeStats.sangrias.total_amount || 0,
        netProfit: financeStats.summary.lucroLiquido,
        monthlyData,
        paymentMethods: paymentMethodsData,
        categoryData
      });

      // Carregar histórico de pagamentos
      await loadPaymentHistory();

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const [receivablesRes, payablesRes, employeesRes, sangriasRes] = await Promise.all([
        api.get('/receivables'),
        api.get('/payables'),
        api.get('/employees'),
        api.get('/cashier/sangrias')
      ]);

      const history: PaymentHistory[] = [];

      // Adicionar contas a receber pagas
      receivablesRes.data
        .filter((r: any) => r.status === 'paid')
        .forEach((r: any) => {
          history.push({
            id: r.id,
            description: r.description,
            amount: r.amount,
            type: 'receivable',
            date: r.payment_date || r.created_at,
            status: 'Pago',
            payment_method: r.payment_method,
            category: r.category
          });
        });

      // Adicionar contas a pagar pagas
      payablesRes.data
        .filter((p: any) => p.status === 'paid')
        .forEach((p: any) => {
          history.push({
            id: p.id,
            description: p.description,
            amount: -p.amount, // Negativo pois é despesa
            type: 'payable',
            date: p.payment_date || p.created_at,
            status: 'Pago',
            payment_method: p.payment_method,
            category: p.category
          });
        });

      // Adicionar salários
      employeesRes.data.forEach((emp: any) => {
        if (emp.salary) {
          history.push({
            id: emp.id,
            description: `Salário - ${emp.name}`,
            amount: -emp.salary, // Negativo pois é despesa
            type: 'salary',
            date: new Date().toISOString().split('T')[0], // Data atual
            status: 'Pendente',
            payment_method: 'bank_transfer',
            category: 'Salários'
          });
        }
      });

      // Adicionar sangrias
      sangriasRes.data.forEach((sangria: any) => {
        history.push({
          id: sangria.id,
          description: `Sangria - ${sangria.reason}`,
          amount: -sangria.amount, // Negativo pois é saída
          type: 'sangria',
          date: sangria.created_at,
          status: 'Realizada',
          payment_method: 'cash',
          category: 'Sangria'
        });
      });

      // Ordenar por data
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPaymentHistory(history);

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const generateMonthlyData = (receivables: any, payables: any, sales: any, salaries: number, sangrias: any[]) => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      // Dados simulados por mês (em produção, você filtraria por data)
      const receitas = Math.random() * 20000 + 10000;
      const despesas = Math.random() * 15000 + 8000;
      const lucro = receitas - despesas;
      
      months.push({
        month: monthName,
        receitas: Math.round(receitas),
        despesas: Math.round(despesas),
        lucro: Math.round(lucro)
      });
    }
    
    return months;
  };

  const generatePaymentMethodsData = (receivables: any, payables: any, sales: any) => {
    return [
      { method: 'Cartão de Crédito', percentage: 45, amount: 67500 },
      { method: 'Dinheiro', percentage: 25, amount: 37500 },
      { method: 'PIX', percentage: 20, amount: 30000 },
      { method: 'Transferência', percentage: 10, amount: 15000 },
    ];
  };

  const generateCategoryData = (receivables: any, payables: any) => {
    return [
      { name: 'Vendas', value: 35, color: '#8884d8' },
      { name: 'Serviços', value: 25, color: '#82ca9d' },
      { name: 'Fornecedores', value: 20, color: '#ffc658' },
      { name: 'Salários', value: 15, color: '#ff7c7c' },
      { name: 'Outros', value: 5, color: '#8dd1e1' },
    ];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receivable': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'payable': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'salary': return <Users className="h-4 w-4 text-blue-600" />;
      case 'sangria': return <Wallet className="h-4 w-4 text-orange-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'receivable': return 'Receita';
      case 'payable': return 'Despesa';
      case 'salary': return 'Salário';
      case 'sangria': return 'Sangria';
      default: return 'Outro';
    }
  };

  const filteredHistory = paymentHistory.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando relatórios financeiros...</span>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Erro ao carregar dados financeiros</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Análises completas do desempenho financeiro da franquia
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mês</SelectItem>
              <SelectItem value="3months">3 meses</SelectItem>
              <SelectItem value="6months">6 meses</SelectItem>
              <SelectItem value="1year">1 ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.totalReceivables + financialData.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              Contas recebidas + Vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialData.totalPayables + financialData.totalSalaries + financialData.totalSangrias)}
            </div>
            <p className="text-xs text-muted-foreground">
              Contas pagas + Salários + Sangrias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialData.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialData.netProfit >= 0 ? 'Lucro' : 'Prejuízo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salários</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(financialData.totalSalaries)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de salários
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Receitas vs Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas vs Despesas - Últimos 6 Meses</CardTitle>
          <CardDescription>
            Comparativo mensal do desempenho financeiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={financialData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), '']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>
              Percentual de receitas e despesas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financialData.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>
              Preferências dos clientes no pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialData.paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">{method.method}</div>
                    <Badge variant="secondary">{method.percentage}%</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(method.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Registro completo de todas as movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(item.amount))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.payment_method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={item.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="text-sm">{getTypeLabel(item.type)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceReports;
