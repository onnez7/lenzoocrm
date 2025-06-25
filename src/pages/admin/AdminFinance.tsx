
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminFinanceOverview } from "@/components/admin/finance/AdminFinanceOverview";
import { AdminFinanceTransactions } from "@/components/admin/finance/AdminFinanceTransactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Download, 
  Calendar,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function AdminFinance() {
  const upcomingPayments = [
    { tenant: 'Ótica Visão Clara', amount: 199.90, dueDate: '2024-12-15', status: 'pending' },
    { tenant: 'Ótica Moderna', amount: 99.90, dueDate: '2024-12-16', status: 'pending' },
    { tenant: 'Ótica Central', amount: 199.90, dueDate: '2024-12-18', status: 'overdue' },
  ];

  const recentRefunds = [
    { tenant: 'Ótica Vista Bela', amount: 399.90, date: '2024-12-08', reason: 'Cancelamento voluntário' },
    { tenant: 'Ótica Novo Horizonte', amount: 99.90, date: '2024-12-05', reason: 'Problema técnico' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="text-gray-600 mt-1">Controle completo das receitas e transações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Este Mês
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Relatório
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="receivables" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            A Receber
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminFinanceOverview />
        </TabsContent>

        <TabsContent value="transactions">
          <AdminFinanceTransactions />
        </TabsContent>

        <TabsContent value="receivables" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pagamentos Pendentes
                </CardTitle>
                <CardDescription>Cobranças com vencimento próximo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingPayments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{payment.tenant}</h4>
                        <p className="text-sm text-gray-500">
                          Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">R$ {payment.amount.toFixed(2)}</div>
                        <Badge className={
                          payment.status === 'overdue' 
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }>
                          {payment.status === 'overdue' ? 'Vencida' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Reembolsos Recentes
                </CardTitle>
                <CardDescription>Estornos e cancelamentos processados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRefunds.map((refund, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{refund.tenant}</h4>
                        <p className="text-sm text-gray-500">{refund.reason}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">-R$ {refund.amount.toFixed(2)}</div>
                        <p className="text-xs text-gray-500">
                          {new Date(refund.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo A Receber */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Recebíveis</CardTitle>
              <CardDescription>Análise detalhada dos valores a receber</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">R$ 4.798,80</div>
                  <div className="text-sm text-gray-600">MRR Atual</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">R$ 499,70</div>
                  <div className="text-sm text-gray-600">Pendente</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">R$ 199,90</div>
                  <div className="text-sm text-gray-600">Em Atraso</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">R$ 5.798,40</div>
                  <div className="text-sm text-gray-600">Projeção Próximo Mês</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Relatório Mensal
                </CardTitle>
                <CardDescription>Resumo completo do mês atual</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Análise de Crescimento
                </CardTitle>
                <CardDescription>Métricas de crescimento e tendências</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Relatório de Transações
                </CardTitle>
                <CardDescription>Detalhamento de todas as transações</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios Automáticos</CardTitle>
              <CardDescription>Configure relatórios para serem enviados automaticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Relatório Semanal</h4>
                    <p className="text-sm text-gray-500">Toda segunda-feira às 09:00</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Relatório Mensal</h4>
                    <p className="text-sm text-gray-500">Todo dia 1º às 08:00</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Inativo</Badge>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
