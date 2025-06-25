
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
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, DollarSign, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Receivable {
  id: string;
  clientName: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  invoiceNumber?: string;
  installments?: string;
  paymentMethod?: string;
}

const mockReceivables: Receivable[] = [
  {
    id: "1",
    clientName: "Maria Silva",
    description: "Óculos Ray-Ban + Lentes",
    amount: 850.00,
    dueDate: new Date("2024-01-15"),
    status: "pending",
    invoiceNumber: "VD-2024-001",
    installments: "1/3"
  },
  {
    id: "2",
    clientName: "João Santos",
    description: "Consulta + Armação Oakley",
    amount: 420.00,
    dueDate: new Date("2024-01-10"),
    status: "paid",
    invoiceNumber: "VD-2024-002",
    paymentMethod: "Cartão"
  },
  {
    id: "3",
    clientName: "Ana Costa",
    description: "Lentes de Contato Acuvue",
    amount: 180.50,
    dueDate: new Date("2024-01-20"),
    status: "pending",
    invoiceNumber: "VD-2024-003"
  },
  {
    id: "4",
    clientName: "Carlos Oliveira",
    description: "Óculos Prada + Consulta",
    amount: 1200.00,
    dueDate: new Date("2024-01-05"),
    status: "overdue",
    invoiceNumber: "VD-2024-004",
    installments: "2/4"
  },
  {
    id: "5",
    clientName: "Lucia Pereira",
    description: "Armação + Lentes Multifocais",
    amount: 650.00,
    dueDate: new Date("2024-01-18"),
    status: "partial",
    invoiceNumber: "VD-2024-005",
    installments: "1/2"
  }
];

const FinanceReceivables = () => {
  const [receivables, setReceivables] = useState<Receivable[]>(mockReceivables);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredReceivables = receivables.filter(receivable => {
    const matchesSearch = receivable.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receivable.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || receivable.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      case 'partial': return 'Parcial';
      default: return status;
    }
  };

  const totalPending = receivables
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalOverdue = receivables
    .filter(r => r.status === 'overdue')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalReceived = receivables
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPartial = receivables
    .filter(r => r.status === 'partial')
    .reduce((sum, r) => sum + r.amount, 0);

  const markAsPaid = (id: string) => {
    setReceivables(prev => prev.map(receivable => 
      receivable.id === id ? { ...receivable, status: 'paid' as const } : receivable
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground">
            Gerencie suas vendas e recebimentos
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conta a Receber</DialogTitle>
              <DialogDescription>
                Registre uma nova venda ou serviço para recebimento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Input id="client" placeholder="Nome do cliente" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" placeholder="Descrição da venda/serviço" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor</Label>
                <Input id="amount" type="number" placeholder="0,00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="installments">Parcelamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">À vista</SelectItem>
                    <SelectItem value="2x">2x sem juros</SelectItem>
                    <SelectItem value="3x">3x sem juros</SelectItem>
                    <SelectItem value="4x">4x sem juros</SelectItem>
                    <SelectItem value="6x">6x sem juros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {receivables.filter(r => r.status === 'pending').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {receivables.filter(r => r.status === 'overdue').length} contas vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parciais</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {totalPartial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {receivables.filter(r => r.status === 'partial').length} pagamentos parciais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {receivables.filter(r => r.status === 'paid').length} contas recebidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Receber</CardTitle>
          <CardDescription>
            Lista de todas as vendas e serviços registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
                <SelectItem value="partial">Parciais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceivables.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell className="font-medium">
                    {receivable.clientName}
                    {receivable.invoiceNumber && (
                      <div className="text-sm text-muted-foreground">
                        NF: {receivable.invoiceNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{receivable.description}</TableCell>
                  <TableCell>
                    R$ {receivable.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {format(receivable.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {receivable.installments || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(receivable.status)}>
                      {getStatusLabel(receivable.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {receivable.status !== 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsPaid(receivable.id)}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Marcar como Pago
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredReceivables.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma conta encontrada com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceReceivables;
