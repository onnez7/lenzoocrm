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
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Loader2,
  Filter,
  User,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import receivableService, { Receivable, CreateReceivableData } from "@/services/receivableService";

interface Client {
  id: number;
  name: string;
  cpf: string;
}

interface Installment {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  order_number: string;
  order_total: number;
}

const FinanceReceivables = () => {
  const { toast } = useToast();
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [clientInstallments, setClientInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInstallmentsDialogOpen, setIsInstallmentsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState<CreateReceivableData>({
    description: '',
    amount: 0,
    due_date: '',
    client_name: '',
    category: 'sales',
    payment_method: 'bank_transfer',
    notes: ''
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [receivablesData, clientsData] = await Promise.all([
        receivableService.getReceivables(),
        receivableService.getClients()
      ]);
      setReceivables(receivablesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientChange = async (clientId: number) => {
    setSelectedClient(clientId);
    if (clientId) {
      try {
        const installments = await receivableService.getClientInstallments(clientId);
        setClientInstallments(installments);
        setIsInstallmentsDialogOpen(true);
      } catch (error) {
        console.error('Erro ao carregar parcelas do cliente:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar parcelas do cliente",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddReceivable = async () => {
    try {
      await receivableService.createReceivable(formData);
      toast({
        title: "Sucesso",
        description: "Conta a receber adicionada com sucesso!",
      });
      setIsDialogOpen(false);
      setFormData({
        description: '',
        amount: 0,
        due_date: '',
        client_name: '',
        category: 'sales',
        payment_method: 'bank_transfer',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Erro ao criar conta a receber:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta a receber",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsReceived = async (id: number) => {
    try {
      await receivableService.markAsReceived(id);
      toast({
        title: "Sucesso",
        description: "Conta marcada como recebida!",
      });
      loadData();
    } catch (error) {
      console.error('Erro ao marcar como recebida:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar como recebida",
        variant: "destructive",
      });
    }
  };

  // Filtrar contas
  const filteredReceivables = receivables.filter(receivable => {
    const matchesSearch = receivable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receivable.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "received" && receivable.status === 'paid') ||
                         (statusFilter === "pending" && receivable.status === 'pending');
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const totalAmount = receivables.reduce((sum, receivable) => sum + receivable.amount, 0);
  const receivedAmount = receivables.filter(r => r.status === 'paid').reduce((sum, receivable) => sum + receivable.amount, 0);
  const pendingAmount = totalAmount - receivedAmount;
  const overdueCount = receivables.filter(r => r.status !== 'paid' && new Date(r.due_date) < new Date()).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando contas a receber...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas a receber e clientes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsInstallmentsDialogOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Ver Parcelas
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Conta a Receber</DialogTitle>
                <DialogDescription>
                  Adicione uma nova conta a receber ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input 
                    id="description" 
                    placeholder="Ex: Venda de óculos"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select 
                    value={formData.client_name} 
                    onValueChange={(value) => setFormData({...formData, client_name: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.name}>
                          {client.name} - {client.cpf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input 
                      id="amount" 
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Vencimento</Label>
                    <Input 
                      id="dueDate" 
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: any) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="services">Serviços</SelectItem>
                      <SelectItem value="consultations">Consultas</SelectItem>
                      <SelectItem value="rentals">Aluguel</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value: any) => setFormData({...formData, payment_method: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Transferência</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Observações adicionais"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddReceivable}>
                  Adicionar Conta a Receber
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivableService.formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{receivableService.formatCurrency(receivedAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{receivableService.formatCurrency(pendingAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por descrição ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="received">Recebidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Receber</CardTitle>
          <CardDescription>
            Lista de todas as contas a receber do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceivables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Nenhuma conta a receber encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceivables.map((receivable) => (
                  <TableRow key={receivable.id}>
                    <TableCell>{receivable.description}</TableCell>
                    <TableCell>{receivable.client_name}</TableCell>
                    <TableCell>{receivableService.formatCurrency(receivable.amount)}</TableCell>
                    <TableCell>{receivableService.formatDate(receivable.due_date)}</TableCell>
                    <TableCell>
                      <Badge className={receivableService.getStatusColor(receivable.status, receivable.due_date)}>
                        {receivableService.getStatusLabel(receivable.status, receivable.due_date)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {receivable.status !== 'paid' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsReceived(receivable.id)}
                        >
                          Marcar como Recebida
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Parcelas Pendentes */}
      <Dialog open={isInstallmentsDialogOpen} onOpenChange={setIsInstallmentsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Parcelas Pendentes</DialogTitle>
            <DialogDescription>
              Visualize e gerencie as parcelas pendentes dos clientes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="clientSelect">Selecionar Cliente</Label>
                <Select onValueChange={(value) => handleClientChange(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} - {client.cpf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {clientInstallments.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Parcelas Pendentes</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Valor Parcela</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientInstallments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.description}</TableCell>
                        <TableCell>{installment.order_number}</TableCell>
                        <TableCell>{receivableService.formatCurrency(installment.amount)}</TableCell>
                        <TableCell>{receivableService.formatCurrency(installment.order_total)}</TableCell>
                        <TableCell>{receivableService.formatDate(installment.due_date)}</TableCell>
                        <TableCell>
                          <Badge className={receivableService.getStatusColor(false, installment.due_date)}>
                            {receivableService.getStatusLabel(false, installment.due_date)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {selectedClient && clientInstallments.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma parcela pendente para este cliente</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceReceivables;
