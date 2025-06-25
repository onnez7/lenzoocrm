
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
import { Plus, Search, CreditCard, Building2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'business';
  accountNumber: string;
  agency: string;
  balance: number;
  isActive: boolean;
  pixKey?: string;
}

interface CreditCard {
  id: string;
  cardName: string;
  bankName: string;
  lastFourDigits: string;
  brand: string;
  limit: number;
  availableLimit: number;
  dueDate: number;
  isActive: boolean;
}

const mockBankAccounts: BankAccount[] = [
  {
    id: "1",
    bankName: "Banco do Brasil",
    accountType: "business",
    accountNumber: "12345-6",
    agency: "1234-5",
    balance: 15750.00,
    isActive: true,
    pixKey: "12.345.678/0001-90"
  },
  {
    id: "2",
    bankName: "Itaú",
    accountType: "checking",
    accountNumber: "98765-4",
    agency: "9876-5",
    balance: 8200.00,
    isActive: true,
    pixKey: "+55 11 99999-9999"
  }
];

const mockCreditCards: CreditCard[] = [
  {
    id: "1",
    cardName: "Cartão Empresarial",
    bankName: "Banco do Brasil",
    lastFourDigits: "1234",
    brand: "Visa",
    limit: 10000.00,
    availableLimit: 7500.00,
    dueDate: 15,
    isActive: true
  },
  {
    id: "2",
    cardName: "Itaú Click Empresarial",
    bankName: "Itaú",
    lastFourDigits: "5678",
    brand: "Mastercard",
    limit: 15000.00,
    availableLimit: 12000.00,
    dueDate: 10,
    isActive: true
  }
];

const FinanceBanks = () => {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(mockCreditCards);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(false);

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'business': return 'Conta Empresarial';
      default: return type;
    }
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
  const totalAvailableCredit = creditCards.reduce((sum, card) => sum + card.availableLimit, 0);

  const handleAddBankAccount = () => {
    toast({
      title: "Conta bancária adicionada",
      description: "A conta foi adicionada com sucesso!",
    });
    setIsBankDialogOpen(false);
  };

  const handleAddCreditCard = () => {
    toast({
      title: "Cartão de crédito adicionado",
      description: "O cartão foi adicionado com sucesso!",
    });
    setIsCardDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas Bancárias e Cartões</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias e cartões de crédito
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta Bancária</DialogTitle>
                <DialogDescription>
                  Adicione uma nova conta bancária ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bankName">Nome do Banco</Label>
                  <Input id="bankName" placeholder="Ex: Banco do Brasil" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountType">Tipo de Conta</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta Corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="business">Conta Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="agency">Agência</Label>
                    <Input id="agency" placeholder="1234-5" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account">Conta</Label>
                    <Input id="account" placeholder="12345-6" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pixKey">Chave PIX (opcional)</Label>
                  <Input id="pixKey" placeholder="CPF, CNPJ, E-mail ou Telefone" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBankDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddBankAccount}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Cartão de Crédito</DialogTitle>
                <DialogDescription>
                  Adicione um novo cartão de crédito ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cardName">Nome do Cartão</Label>
                  <Input id="cardName" placeholder="Ex: Cartão Empresarial" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cardBank">Banco</Label>
                  <Input id="cardBank" placeholder="Ex: Banco do Brasil" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cardBrand">Bandeira</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="mastercard">Mastercard</SelectItem>
                        <SelectItem value="elo">Elo</SelectItem>
                        <SelectItem value="amex">American Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastDigits">Últimos 4 dígitos</Label>
                    <Input id="lastDigits" placeholder="1234" maxLength={4} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="limit">Limite</Label>
                    <Input id="limit" type="number" placeholder="10000.00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Dia do Vencimento</Label>
                    <Input id="dueDate" type="number" placeholder="15" min="1" max="31" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCardDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCreditCard}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {showBalances ? `R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ •••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              {bankAccounts.length} contas bancárias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {totalCreditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {creditCards.length} cartões de crédito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédito Disponível</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {totalAvailableCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Crédito disponível
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contas Bancárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Contas Bancárias
          </CardTitle>
          <CardDescription>
            Suas contas bancárias cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banco</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Agência/Conta</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>PIX</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.bankName}</TableCell>
                  <TableCell>{getAccountTypeLabel(account.accountType)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Ag: {account.agency}</div>
                      <div>Cc: {account.accountNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      {showBalances ? `R$ ${account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ •••••"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.pixKey || "Não cadastrado"}
                  </TableCell>
                  <TableCell>
                    <Badge className={account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {account.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cartões de Crédito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Cartões de Crédito
          </CardTitle>
          <CardDescription>
            Seus cartões de crédito cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cartão</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Final</TableHead>
                <TableHead>Bandeira</TableHead>
                <TableHead>Limite</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium">{card.cardName}</TableCell>
                  <TableCell>{card.bankName}</TableCell>
                  <TableCell>•••• {card.lastFourDigits}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{card.brand}</Badge>
                  </TableCell>
                  <TableCell>
                    R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-blue-600">
                      R$ {card.availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>Dia {card.dueDate}</TableCell>
                  <TableCell>
                    <Badge className={card.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {card.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
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

export default FinanceBanks;
