
import { useState } from "react";
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
  CheckCircle
} from "lucide-react";

const CashierHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const cashierSessions = [
    {
      id: "CS-001",
      date: "2024-01-15",
      employeeName: "Ana Oliveira",
      openTime: "08:00",
      closeTime: "18:30",
      initialAmount: 100.00,
      totalSales: 2380.00,
      finalAmount: 2480.00,
      difference: 0.00,
      status: "closed",
      notes: "Fechamento normal",
    },
    {
      id: "CS-002", 
      date: "2024-01-14",
      employeeName: "Carlos Pereira",
      openTime: "08:30",
      closeTime: "18:15",
      initialAmount: 100.00,
      totalSales: 1950.00,
      finalAmount: 2045.00,
      difference: -5.00,
      status: "closed",
      notes: "Diferença de R$ 5,00 - moeda perdida",
    },
    {
      id: "CS-003",
      date: "2024-01-13",
      employeeName: "Lucia Mendes",
      openTime: "08:15",
      closeTime: "18:45",
      initialAmount: 100.00,
      totalSales: 3250.00,
      finalAmount: 3355.00,
      difference: 5.00,
      status: "closed",
      notes: "Sobra de R$ 5,00 - gorjeta cliente",
    },
    {
      id: "CS-004",
      date: "2024-01-16",
      employeeName: "Ana Oliveira",
      openTime: "08:00",
      closeTime: null,
      initialAmount: 100.00,
      totalSales: 1150.00,
      finalAmount: 0,
      difference: 0,
      status: "open",
      notes: "Caixa em andamento",
    },
  ];

  const filteredSessions = cashierSessions.filter(session =>
    session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.date.includes(searchTerm)
  );

  const getStatusBadge = (status: string, difference: number) => {
    if (status === "open") {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Aberto</Badge>;
    }
    
    if (difference === 0) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Conferido</Badge>;
    } else if (difference > 0) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Com Sobra</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Com Falta</Badge>;
    }
  };

  const getStatusIcon = (status: string, difference: number) => {
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
    .reduce((sum, session) => sum + session.totalSales, 0);

  const averageSales = totalSales / cashierSessions.filter(s => s.status === "closed").length;

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
                  <TableCell className="font-medium">{session.id}</TableCell>
                  <TableCell>
                    {new Date(session.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{session.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Abertura: {session.openTime}</div>
                      {session.closeTime && (
                        <div>Fechamento: {session.closeTime}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {session.totalSales.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {session.status === "closed" && (
                      <span className={`font-medium ${
                        session.difference === 0 ? 'text-blue-600' :
                        session.difference > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {session.difference > 0 ? '+' : ''}R$ {session.difference.toFixed(2)}
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
