
import { useState } from "react";
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
  Search, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  AlertCircle
} from "lucide-react";

const mockTransactions = [
  {
    id: 'txn_001',
    tenantName: 'Ótica Visão Clara',
    amount: 199.90,
    plan: 'Premium',
    status: 'completed',
    method: 'card',
    date: '2024-12-10',
    stripeId: 'pi_3Oxx123456789',
    invoice: 'in_001'
  },
  {
    id: 'txn_002',
    tenantName: 'Ótica Moderna',
    amount: 99.90,
    plan: 'Básico',
    status: 'completed',
    method: 'pix',
    date: '2024-12-09',
    stripeId: 'pi_3Oxy987654321',
    invoice: 'in_002'
  },
  {
    id: 'txn_003',
    tenantName: 'Ótica Central',
    amount: 199.90,
    plan: 'Premium',
    status: 'pending',
    method: 'boleto',
    date: '2024-12-08',
    stripeId: 'pi_3Oxz456789123',
    invoice: 'in_003'
  },
  {
    id: 'txn_004',
    tenantName: 'Ótica Vista Bela',
    amount: 399.90,
    plan: 'Enterprise',
    status: 'failed',
    method: 'card',
    date: '2024-12-07',
    stripeId: 'pi_3Oxa789123456',
    invoice: 'in_004'
  },
  {
    id: 'txn_005',
    tenantName: 'Ótica Novo Olhar',
    amount: 99.90,
    plan: 'Básico',
    status: 'completed',
    method: 'card',
    date: '2024-12-06',
    stripeId: 'pi_3Oxb321654987',
    invoice: 'in_005'
  }
];

export function AdminFinanceTransactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <div className="h-4 w-4 bg-green-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">P</div>;
      case 'boleto':
        return <div className="h-4 w-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">B</div>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesPlan = planFilter === 'all' || transaction.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedAmount = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{filteredTransactions.length} transações</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Confirmado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {completedAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Pagamentos concluídos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {((filteredTransactions.filter(t => t.status === 'completed').length / filteredTransactions.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">Transações bem-sucedidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Financeiras</CardTitle>
          <CardDescription>Histórico completo de pagamentos e cobranças</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por franqueado ou ID da transação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="failed">Falhada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Planos</SelectItem>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          {/* Lista de Transações */}
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      {getMethodIcon(transaction.method)}
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.tenantName}</h4>
                      <p className="text-sm text-gray-500">
                        {transaction.id} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        R$ {transaction.amount.toFixed(2)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {transaction.plan}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(transaction.status)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t text-xs text-gray-500 flex justify-between">
                  <span>Stripe ID: {transaction.stripeId}</span>
                  <span>Fatura: {transaction.invoice}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma transação encontrada com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
