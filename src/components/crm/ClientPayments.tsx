import { useEffect, useState } from "react";
import { clientPaymentService, ClientPayment, CreateClientPaymentPayload } from "@/services/clientPaymentService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ClientPaymentsProps {
  clientId: number;
}

export function ClientPayments({ clientId }: ClientPaymentsProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchPayments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await clientPaymentService.getAll(token, { clientId });
      setPayments(data);
    } catch {
      toast({ title: "Erro", description: "Erro ao buscar pagamentos do cliente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line
  }, [clientId, token]);

  const handleCreate = async () => {
    if (!token || !amount || !method) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      const payload: CreateClientPaymentPayload = {
        client_id: clientId,
        amount: parseFloat(amount),
        method,
        due_date: dueDate || undefined
      };
      await clientPaymentService.create(payload, token);
      toast({ title: "Cobrança criada com sucesso!" });
      setIsDialogOpen(false);
      setAmount("");
      setMethod("");
      setDueDate("");
      fetchPayments();
    } catch {
      toast({ title: "Erro ao criar cobrança", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Pagamentos do Cliente</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Novo Pagamento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Cobrança</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Valor (R$)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Vencimento (opcional)"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
              <Button onClick={handleCreate} className="w-full">Criar Cobrança</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Pago em</TableHead>
            <TableHead>Criado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell>{p.method}</TableCell>
              <TableCell>{p.due_date ? new Date(p.due_date).toLocaleDateString('pt-BR') : '-'}</TableCell>
              <TableCell>{p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '-'}</TableCell>
              <TableCell>{new Date(p.created_at).toLocaleDateString('pt-BR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {loading && <div className="text-center text-muted-foreground">Carregando...</div>}
      {!loading && payments.length === 0 && <div className="text-center text-muted-foreground">Nenhum pagamento encontrado.</div>}
    </div>
  );
} 