
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  User, 
  Calendar,
  Plus,
  Minus,
  History,
  AlertCircle
} from "lucide-react";
import { SangriaDialog } from "@/components/cashier/SangriaDialog";

interface SangriaRecord {
  id: string;
  amount: number;
  description: string;
  timestamp: Date;
  user: string;
}

const Cashier = () => {
  const [isSangriaDialogOpen, setIsSangriaDialogOpen] = useState(false);
  const [sangriaRecords, setSangriaRecords] = useState<SangriaRecord[]>([]);
  
  // Mock data - simular que o caixa está aberto
  const [currentSession, setCurrentSession] = useState({
    id: "CS-004",
    isOpen: true,
    employee: "Ana Oliveira",
    openTime: "08:00",
    date: "2024-01-16",
    initialAmount: 100.00,
    currentSales: 1150.00,
    cashSales: 320.00,
    cardSales: 580.00,
    pixSales: 250.00,
    totalSangria: 0.00,
  });

  const todayStats = {
    totalTransactions: 15,
    averageTicket: 76.67,
    lastSale: "14:30",
  };

  const handleSangria = (amount: number, description: string) => {
    const newSangria: SangriaRecord = {
      id: Date.now().toString(),
      amount,
      description,
      timestamp: new Date(),
      user: currentSession.employee,
    };

    setSangriaRecords(prev => [...prev, newSangria]);
    setCurrentSession(prev => ({
      ...prev,
      totalSangria: prev.totalSangria + amount,
      cashSales: Math.max(0, prev.cashSales - amount) // Reduz do dinheiro disponível
    }));
  };

  // Calcula o total esperado menos as sangrias
  const totalExpected = currentSession.initialAmount + currentSession.currentSales - currentSession.totalSangria;

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
          {!currentSession.isOpen ? (
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
              >
                <Minus className="h-4 w-4 mr-2" />
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
      <Card className={currentSession.isOpen ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className={`h-5 w-5 ${currentSession.isOpen ? 'text-green-600' : 'text-red-600'}`} />
              <span>Status do Caixa</span>
            </CardTitle>
            <Badge variant={currentSession.isOpen ? "default" : "secondary"} 
                   className={currentSession.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {currentSession.isOpen ? "ABERTO" : "FECHADO"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {currentSession.isOpen ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Funcionário</div>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{currentSession.employee}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Abertura</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{currentSession.openTime}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Data</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {new Date(currentSession.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Valor Inicial</div>
                <div className="font-medium text-lg mt-1">
                  R$ {currentSession.initialAmount.toFixed(2)}
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

      {currentSession.isOpen && (
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
                  R$ {currentSession.currentSales.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayStats.totalTransactions} transações
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
                  R$ {todayStats.averageTicket.toFixed(2)}
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
                  R$ {currentSession.totalSangria.toFixed(2)}
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
                Distribuição das vendas de hoje por método de pagamento
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
                    R$ {currentSession.cashSales.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((currentSession.cashSales / currentSession.currentSales) * 100).toFixed(1)}% do total
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cartão</span>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {currentSession.cardSales.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((currentSession.cardSales / currentSession.currentSales) * 100).toFixed(1)}% do total
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">PIX</span>
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {currentSession.pixSales.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((currentSession.pixSales / currentSession.currentSales) * 100).toFixed(1)}% do total
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
                  Sangrias do Dia
                </CardTitle>
                <CardDescription>
                  Retiradas realizadas no caixa hoje
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
      />
    </div>
  );
};

export default Cashier;
