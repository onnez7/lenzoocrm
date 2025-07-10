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
import { Plus, Search, CreditCard as CreditCardIcon, Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import bankAccountService, { BankAccount, CreateBankAccountData } from "@/services/bankAccountService";
import creditCardService, { CreditCard, CreateCreditCardData } from "@/services/creditCardService";

const FinanceBanks = () => {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(false);
  const [bankFormData, setBankFormData] = useState<CreateBankAccountData>({
    bank_name: '',
    account_type: 'checking',
    account_number: '',
    agency: '',
    balance: 0,
    pix_key: ''
  });
  const [cardFormData, setCardFormData] = useState<CreateCreditCardData>({
    card_name: '',
    bank_name: '',
    last_four_digits: '',
    brand: 'visa',
    limit_amount: 0,
    due_date: 15
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [bankData, cardData] = await Promise.all([
        bankAccountService.getBankAccounts(),
        creditCardService.getCreditCards()
      ]);
      setBankAccounts(bankData);
      setCreditCards(cardData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBankAccount = async () => {
    try {
      await bankAccountService.createBankAccount(bankFormData);
      toast({
        title: "Sucesso",
        description: "Conta bancária adicionada com sucesso!",
      });
      setIsBankDialogOpen(false);
      setBankFormData({
        bank_name: '',
        account_type: 'checking',
        account_number: '',
        agency: '',
        balance: 0,
        pix_key: ''
      });
      loadData();
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta bancária",
        variant: "destructive",
      });
    }
  };

  const handleAddCreditCard = async () => {
    try {
      await creditCardService.createCreditCard(cardFormData);
      toast({
        title: "Sucesso",
        description: "Cartão de crédito adicionado com sucesso!",
      });
      setIsCardDialogOpen(false);
      setCardFormData({
        card_name: '',
        bank_name: '',
        last_four_digits: '',
        brand: 'visa',
        limit_amount: 0,
        due_date: 15
      });
      loadData();
    } catch (error) {
      console.error('Erro ao criar cartão de crédito:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar cartão de crédito",
        variant: "destructive",
      });
    }
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit_amount, 0);
  const totalAvailableCredit = creditCards.reduce((sum, card) => sum + card.available_limit, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    );
  }

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
                  <Input 
                    id="bankName" 
                    placeholder="Ex: Banco do Brasil"
                    value={bankFormData.bank_name}
                    onChange={(e) => setBankFormData({...bankFormData, bank_name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountType">Tipo de Conta</Label>
                  <Select 
                    value={bankFormData.account_type} 
                    onValueChange={(value: 'checking' | 'savings' | 'business') => 
                      setBankFormData({...bankFormData, account_type: value})
                    }
                  >
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
                    <Input 
                      id="agency" 
                      placeholder="1234-5"
                      value={bankFormData.agency}
                      onChange={(e) => setBankFormData({...bankFormData, agency: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account">Conta</Label>
                    <Input 
                      id="account" 
                      placeholder="12345-6"
                      value={bankFormData.account_number}
                      onChange={(e) => setBankFormData({...bankFormData, account_number: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balance">Saldo Inicial</Label>
                  <Input 
                    id="balance" 
                    type="number" 
                    placeholder="0,00"
                    value={bankFormData.balance}
                    onChange={(e) => setBankFormData({...bankFormData, balance: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pixKey">Chave PIX (opcional)</Label>
                  <Input 
                    id="pixKey" 
                    placeholder="CPF, CNPJ, E-mail ou Telefone"
                    value={bankFormData.pix_key}
                    onChange={(e) => setBankFormData({...bankFormData, pix_key: e.target.value})}
                  />
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
                <CreditCardIcon className="mr-2 h-4 w-4" />
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
                  <Input 
                    id="cardName" 
                    placeholder="Ex: Cartão Empresarial"
                    value={cardFormData.card_name}
                    onChange={(e) => setCardFormData({...cardFormData, card_name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cardBank">Banco</Label>
                  <Input 
                    id="cardBank" 
                    placeholder="Ex: Banco do Brasil"
                    value={cardFormData.bank_name}
                    onChange={(e) => setCardFormData({...cardFormData, bank_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cardBrand">Bandeira</Label>
                    <Select 
                      value={cardFormData.brand}
                      onValueChange={(value: 'visa' | 'mastercard' | 'elo' | 'amex') => 
                        setCardFormData({...cardFormData, brand: value})
                      }
                    >
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
                    <Input 
                      id="lastDigits" 
                      placeholder="1234" 
                      maxLength={4}
                      value={cardFormData.last_four_digits}
                      onChange={(e) => setCardFormData({...cardFormData, last_four_digits: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="limit">Limite</Label>
                    <Input 
                      id="limit" 
                      type="number" 
                      placeholder="10000.00"
                      value={cardFormData.limit_amount}
                      onChange={(e) => setCardFormData({...cardFormData, limit_amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Dia do Vencimento</Label>
                    <Input 
                      id="dueDate" 
                      type="number" 
                      placeholder="15" 
                      min="1" 
                      max="31"
                      value={cardFormData.due_date}
                      onChange={(e) => setCardFormData({...cardFormData, due_date: parseInt(e.target.value) || 15})}
                    />
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
              {showBalances ? bankAccountService.formatCurrency(totalBalance) : "R$ •••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              {bankAccounts.length} contas bancárias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {creditCardService.formatCurrency(totalCreditLimit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {creditCards.length} cartões de crédito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédito Disponível</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {creditCardService.formatCurrency(totalAvailableCredit)}
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
          {bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma conta bancária cadastrada</p>
            </div>
          ) : (
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
                    <TableCell className="font-medium">{account.bank_name}</TableCell>
                    <TableCell>{bankAccountService.getAccountTypeLabel(account.account_type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Ag: {account.agency}</div>
                        <div>Cc: {account.account_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {showBalances ? bankAccountService.formatCurrency(account.balance) : "R$ •••••"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {account.pix_key || "Não cadastrado"}
                    </TableCell>
                    <TableCell>
                      <Badge className={bankAccountService.getStatusColor(account.is_active)}>
                        {bankAccountService.getStatusLabel(account.is_active)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cartões de Crédito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Cartões de Crédito
          </CardTitle>
          <CardDescription>
            Seus cartões de crédito cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {creditCards.length === 0 ? (
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum cartão de crédito cadastrado</p>
            </div>
          ) : (
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
                    <TableCell className="font-medium">{card.card_name}</TableCell>
                    <TableCell>{card.bank_name}</TableCell>
                    <TableCell>•••• {card.last_four_digits}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{creditCardService.getBrandLabel(card.brand)}</Badge>
                    </TableCell>
                    <TableCell>
                      {creditCardService.formatCurrency(card.limit_amount)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-blue-600">
                        {creditCardService.formatCurrency(card.available_limit)}
                      </span>
                    </TableCell>
                    <TableCell>Dia {card.due_date}</TableCell>
                    <TableCell>
                      <Badge className={creditCardService.getStatusColor(card.is_active)}>
                        {creditCardService.getStatusLabel(card.is_active)}
                      </Badge>
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

export default FinanceBanks;
