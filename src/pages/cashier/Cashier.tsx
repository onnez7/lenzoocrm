import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  User, 
  Calendar,
  Plus,
  Minus,
  History,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { SangriaDialog } from "@/components/cashier/SangriaDialog";
import OrderFinalizationModal from "@/components/cashier/OrderFinalizationModal";
import { cashierService } from "@/services/cashierService";
import { orderService, ServiceOrder, FinalizationData } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SangriaRecord {
  id: string;
  amount: number;
  description: string;
  timestamp: Date;
  user: string;
}

interface CashierSession {
  id: number;
  session_code: string;
  employee_id: number;
  employee_name: string;
  open_time: string;
  close_time: string | null;
  initial_amount: number;
  final_amount: number | null;
  cash_sales: number;
  card_sales: number;
  pix_sales: number;
  total_sales: number;
  difference: number | null;
  status: 'open' | 'closed';
  notes: string | null;
}

const Cashier = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [isSangriaDialogOpen, setIsSangriaDialogOpen] = useState(false);
  const [isOrderFinalizationOpen, setIsOrderFinalizationOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [sangriaRecords, setSangriaRecords] = useState<SangriaRecord[]>([]);
  const [currentSession, setCurrentSession] = useState<CashierSession | null>(null);
  const [sessionOrders, setSessionOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSangria, setIsLoadingSangria] = useState(false);
  const { toast } = useToast();

  // Debug de autenticação
  useEffect(() => {
    console.log('Cashier: Status de autenticação:', { isAuthenticated, user: user?.name, hasToken: !!token });
    console.log('Cashier: Token:', token ? token.substring(0, 50) + '...' : 'Nenhum token');
  }, [isAuthenticated, user, token]);

  // Carregar dados do caixa
  useEffect(() => {
    console.log('Cashier: Iniciando carregamento de dados...');
    loadCashierData();
  }, []);

  const loadCashierData = async () => {
    try {
      setIsLoading(true);
      console.log('Cashier: Chamando checkOpenSession...');
      const response = await cashierService.checkOpenSession();
      console.log('Cashier: Resposta do checkOpenSession:', response);
      
      if (response.session) {
        setCurrentSession(response.session);
        // Carregar sangrias da sessão atual
        await loadSangrias(response.session.id);
        // Carregar ordens da sessão atual
        await loadSessionOrders(response.session.id);
      } else {
        setCurrentSession(null);
        setSessionOrders([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do caixa:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do caixa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSangrias = async (sessionId: number) => {
    try {
      const sangrias = await cashierService.getSangrias(sessionId);
      const sangriaRecords = sangrias.map(sangria => ({
        id: sangria.id.toString(),
        amount: Number(sangria.amount),
        description: sangria.description,
        timestamp: new Date(sangria.created_at),
        user: currentSession?.employee_name || 'Funcionário',
      }));
      setSangriaRecords(sangriaRecords);
    } catch (error) {
      console.error('Erro ao carregar sangrias:', error);
      setSangriaRecords([]);
    }
  };

  const loadSessionOrders = async (sessionId: number) => {
    try {
      const orders = await orderService.getOrders();
      // Filtrar apenas ordens da sessão atual
      const sessionOrders = orders.filter(order => order.session_id === sessionId);
      setSessionOrders(sessionOrders);
    } catch (error) {
      console.error('Erro ao carregar ordens da sessão:', error);
      setSessionOrders([]);
    }
  };

  const handleSangria = async (amount: number, description: string) => {
    if (!currentSession) return;

    try {
      setIsLoadingSangria(true);
      
      // Implementar endpoint para registrar sangria
      await cashierService.registerSangria({
        session_id: currentSession.id,
        amount,
        description
      });

      const newSangria: SangriaRecord = {
        id: Date.now().toString(),
        amount,
        description,
        timestamp: new Date(),
        user: currentSession.employee_name || 'Funcionário',
      };

      setSangriaRecords(prev => [...prev, newSangria]);
      
      // Atualizar dados da sessão
      await loadCashierData();
      
      toast({
        title: "Sangria Registrada",
        description: `Sangria de R$ ${amount.toFixed(2)} registrada com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao registrar sangria:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar sangria.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSangria(false);
      setIsSangriaDialogOpen(false);
    }
  };

  const handleFinalizeOrder = async (finalizationData: FinalizationData) => {
    if (!selectedOrder) return;

    try {
      await orderService.finalizeOrder(selectedOrder.id, finalizationData);
      
      toast({
        title: "Ordem Finalizada!",
        description: `Ordem ${selectedOrder.order_number} finalizada com sucesso.`,
      });

      // Recarregar dados
      await loadCashierData();
    } catch (error) {
      console.error('Erro ao finalizar ordem:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar ordem.",
        variant: "destructive",
      });
    }
  };

  const openFinalizationModal = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsOrderFinalizationOpen(true);
  };

  const totalSangria = sangriaRecords.reduce((sum, sangria) => sum + sangria.amount, 0);
  const totalExpected = currentSession ? 
    Number(currentSession.initial_amount) + Number(currentSession.total_sales) - totalSangria : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados do caixa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Caixa</h1>
          <p className="text-muted-foreground">
            Controle e gerenciamento do caixa diário
          </p>
        </div>
        
        <div className="flex gap-2">
          {!currentSession ? (
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/cashier/open">
                <Plus className="h-4 w-4 mr-2" />
                Abrir Caixa
              </Link>
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => setIsSangriaDialogOpen(true)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                disabled={isLoadingSangria}
              >
                {isLoadingSangria ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Minus className="h-4 w-4 mr-2" />
                )}
                Sangria
              </Button>
              <Button asChild variant="destructive">
                <Link to="/cashier/close">
                  <Minus className="h-4 w-4 mr-2" />
                  Fechar Caixa
                </Link>
              </Button>
            </>
          )}
          
          <Button variant="outline" asChild>
            <Link to="/cashier/history">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Link>
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <Card className={currentSession ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className={`h-5 w-5 ${currentSession ? 'text-green-600' : 'text-red-600'}`} />
              <span>Status do Caixa</span>
            </CardTitle>
            <Badge variant={currentSession ? "default" : "secondary"} 
                   className={currentSession ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {currentSession ? "ABERTO" : "FECHADO"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {currentSession ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Funcionário</div>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{currentSession.employee_name}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Abertura</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {new Date(currentSession.open_time).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Data</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {new Date(currentSession.open_time).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Valor Inicial</div>
                <div className="font-medium text-lg mt-1">
                  R$ {Number(currentSession.initial_amount).toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span>O caixa está fechado. Abra o caixa para iniciar as vendas.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {currentSession && (
        <>
          {/* Current Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {Number(currentSession.total_sales).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de vendas da sessão
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {(Number(currentSession.total_sales) / Math.max(1, sangriaRecords.length + 1)).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Por transação
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Esperado</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  R$ {totalExpected.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Inicial + vendas - sangrias
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sangrias</CardTitle>
                <Minus className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalSangria.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sangriaRecords.length} retiradas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Forma de Pagamento</CardTitle>
              <CardDescription>
                Distribuição das vendas da sessão por método de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Dinheiro</span>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {Number(currentSession.cash_sales).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Number(currentSession.total_sales) > 0 ? 
                      ((Number(currentSession.cash_sales) / Number(currentSession.total_sales)) * 100).toFixed(1) : '0'}% do total
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cartão</span>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {Number(currentSession.card_sales).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Number(currentSession.total_sales) > 0 ? 
                      ((Number(currentSession.card_sales) / Number(currentSession.total_sales)) * 100).toFixed(1) : '0'}% do total
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">PIX</span>
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {Number(currentSession.pix_sales).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Number(currentSession.total_sales) > 0 ? 
                      ((Number(currentSession.pix_sales) / Number(currentSession.total_sales)) * 100).toFixed(1) : '0'}% do total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sangrias do Dia */}
          {sangriaRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-red-600" />
                  Sangrias da Sessão
                </CardTitle>
                <CardDescription>
                  Retiradas realizadas no caixa nesta sessão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sangriaRecords.map((sangria) => (
                    <div key={sangria.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{sangria.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {sangria.timestamp.toLocaleTimeString('pt-BR')} - {sangria.user}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        -R$ {sangria.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ordens da Sessão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Ordens da Sessão
              </CardTitle>
              <CardDescription>
                Ordens de serviço criadas nesta sessão de caixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{order.client_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {order.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                            {order.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-600" />}
                            {order.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {order.status === 'cancelled' && <XCircle className="h-4 w-4 text-red-600" />}
                            <Badge variant="secondary" className={
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {order.status === 'pending' ? 'Pendente' :
                               order.status === 'in_progress' ? 'Em Andamento' :
                               order.status === 'completed' ? 'Concluída' : 'Cancelada'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {order.status === 'pending' ? (
                            <Button 
                              size="sm" 
                              onClick={() => openFinalizationModal(order)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Finalizar
                            </Button>
                          ) : order.status === 'in_progress' ? (
                            <Button 
                              size="sm" 
                              onClick={() => openFinalizationModal(order)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Concluir
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma ordem criada nesta sessão
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild variant="outline" className="h-16">
                  <Link to="/orders/new">
                    <div className="text-center">
                      <Plus className="h-6 w-6 mx-auto mb-2" />
                      <div>Nova Ordem de Serviço</div>
                    </div>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-16">
                  <Link to="/finance/receivables">
                    <div className="text-center">
                      <DollarSign className="h-6 w-6 mx-auto mb-2" />
                      <div>Registrar Pagamento</div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <SangriaDialog
        isOpen={isSangriaDialogOpen}
        onClose={() => setIsSangriaDialogOpen(false)}
        onConfirm={handleSangria}
        isLoading={isLoadingSangria}
      />

      <OrderFinalizationModal
        isOpen={isOrderFinalizationOpen}
        onClose={() => {
          setIsOrderFinalizationOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onFinalize={handleFinalizeOrder}
      />
    </div>
  );
};

export default Cashier;
