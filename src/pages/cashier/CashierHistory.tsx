import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Calendar,
  Search, 
  Eye, 
  DollarSign,
  TrendingUp,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cashierService } from "@/services/cashierService";

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
  created_at: string;
  updated_at: string;
}

const CashierHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cashierSessions, setCashierSessions] = useState<CashierSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Carregar histórico
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const sessions = await cashierService.getHistory();
      setCashierSessions(sessions);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico do caixa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = cashierSessions.filter(session =>
    session.session_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(session.open_time).toLocaleDateString('pt-BR').includes(searchTerm)
  );

  const getStatusBadge = (status: string, difference: number | null) => {
    if (status === "open") {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Aberto</Badge>;
    }
    
    if (difference === 0) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Conferido</Badge>;
    } else if (difference && difference > 0) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Com Sobra</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Com Falta</Badge>;
    }
  };

  const getStatusIcon = (status: string, difference: number | null) => {
    if (status === "open") {
      return <Clock className="h-4 w-4 text-green-600" />;
    }
    
    if (difference === 0) {
      return <CheckCircle className="h-4 w-4 text-blue-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const totalSales = cashierSessions
    .filter(s => s.status === "closed")
    .reduce((sum, session) => sum + Number(session.total_sales || 0), 0);

  const closedSessions = cashierSessions.filter(s => s.status === "closed");
  const averageSales = closedSessions.length > 0 ? totalSales / closedSessions.length : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando histórico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Histórico do Caixa</h1>
        <p className="text-muted-foreground">
          Acompanhe o histórico de aberturas e fechamentos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashierSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalSales.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Dia</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {averageSales.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixas Abertos</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {cashierSessions.filter(s => s.status === "open").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por sessão, funcionário ou data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões</CardTitle>
          <CardDescription>
            Histórico completo de abertura e fechamento do caixa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sessão</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Funcionário</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Diferença</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.session_code}</TableCell>
                  <TableCell>
                    {new Date(session.open_time).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{session.employee_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Abertura: {new Date(session.open_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</div>
                      {session.close_time && (
                        <div>Fechamento: {new Date(session.close_time).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {Number(session.total_sales).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {session.status === "closed" && session.difference !== null && (
                      <span className={`font-medium ${
                        Number(session.difference) === 0 ? 'text-blue-600' :
                        Number(session.difference) > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Number(session.difference) > 0 ? '+' : ''}R$ {Number(session.difference).toFixed(2)}
                      </span>
                    )}
                    {session.status === "open" && (
                      <span className="text-muted-foreground">Em andamento</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(session.status, session.difference)}
                      {getStatusBadge(session.status, session.difference)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierHistory;
