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
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import payableService, { Payable, CreatePayableData } from "@/services/payableService";

const FinancePayables = () => {
  const { toast } = useToast();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState<CreatePayableData>({
    description: '',
    amount: 0,
    due_date: '',
    supplier: '',
    category: 'utilities',
    payment_method: 'bank_transfer',
    notes: ''
  });

  // Carregar contas a pagar
  useEffect(() => {
    loadPayables();
  }, []);

  const loadPayables = async () => {
    try {
      setIsLoading(true);
      const data = await payableService.getPayables();
      setPayables(data);
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contas a pagar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayable = async () => {
    try {
      // Debug: mostrar dados sendo enviados
      console.log('Dados sendo enviados para API:', formData);
      
      await payableService.createPayable(formData);
      toast({
        title: "Sucesso",
        description: "Conta a pagar adicionada com sucesso!",
      });
      setIsDialogOpen(false);
      setFormData({
        description: '',
        amount: 0,
        due_date: '',
        supplier: '',
        category: 'utilities',
        payment_method: 'bank_transfer',
        notes: ''
      });
      loadPayables();
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta a pagar",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await payableService.markAsPaid(id);
      toast({
        title: "Sucesso",
        description: "Conta marcada como paga!",
      });
      loadPayables();
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar como paga",
        variant: "destructive",
      });
    }
  };

  // Filtrar contas
  const filteredPayables = payables.filter(payable => {
    const matchesSearch = payable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payable.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "paid" && payable.status === 'paid') ||
                         (statusFilter === "pending" && payable.status === 'pending');
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const totalAmount = payables.reduce((sum, payable) => sum + payable.amount, 0);
  const paidAmount = payables.filter(p => p.status === 'paid').reduce((sum, payable) => sum + payable.amount, 0);
  const pendingAmount = totalAmount - paidAmount;
  const overdueCount = payables.filter(p => p.status !== 'paid' && new Date(p.due_date) < new Date()).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando contas a pagar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas a pagar e fornecedores
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Conta a Pagar</DialogTitle>
              <DialogDescription>
                Adicione uma nova conta a pagar ao sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input 
                  id="description" 
                  placeholder="Ex: Conta de luz"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input 
                  id="supplier" 
                  placeholder="Nome do fornecedor"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input 
                    id="amount" 
                    type="number" 
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category}
                    onValueChange={(value: 'utilities' | 'rent' | 'supplies' | 'services' | 'taxes' | 'other') => 
                      setFormData({...formData, category: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utilities">Serviços Públicos</SelectItem>
                      <SelectItem value="rent">Aluguel</SelectItem>
                      <SelectItem value="supplies">Fornecimentos</SelectItem>
                      <SelectItem value="services">Serviços</SelectItem>
                      <SelectItem value="taxes">Impostos</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select 
                    value={formData.payment_method}
                    onValueChange={(value: 'bank_transfer' | 'credit_card' | 'pix' | 'cash' | 'check') => 
                      setFormData({...formData, payment_method: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPayable}>
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
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payableService.formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total das contas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Já Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payableService.formatCurrency(paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payables.filter(p => p.status === 'paid').length} contas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payableService.formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payables.filter(p => p.status !== 'paid').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Contas vencidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Pagar</CardTitle>
          <CardDescription>
            Lista de todas as contas a pagar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayables.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {payables.length === 0 ? "Nenhuma conta a pagar cadastrada" : "Nenhuma conta encontrada com os filtros aplicados"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayables.map((payable) => (
                  <TableRow key={payable.id}>
                    <TableCell className="font-medium">{payable.description}</TableCell>
                    <TableCell>{payable.supplier}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payableService.getCategoryLabel(payable.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {payableService.formatCurrency(payable.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {payableService.formatDate(payable.due_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={payableService.getStatusColor(payable.status, payable.due_date)}>
                        {payableService.getStatusLabel(payable.status, payable.due_date)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payable.status !== 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsPaid(payable.id)}
                        >
                          Marcar como Paga
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePayables;
