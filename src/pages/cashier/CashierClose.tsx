import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Calculator, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
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
}

const CashierClose = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cashAmount: "",
    cardAmount: "",
    pixAmount: "",
    notes: "",
  });
  const [currentSession, setCurrentSession] = useState<CashierSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados da sessão atual
  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      setIsLoading(true);
      const response = await cashierService.checkOpenSession();
      
      if (response.session) {
        setCurrentSession(response.session);
      } else {
        toast({
          title: "Erro",
          description: "Não há caixa aberto para fechar.",
          variant: "destructive",
        });
        navigate("/cashier");
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do caixa.",
        variant: "destructive",
      });
      navigate("/cashier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSession) return;
    
    const cashAmount = parseFloat(formData.cashAmount) || 0;
    const cardAmount = parseFloat(formData.cardAmount) || 0;
    const pixAmount = parseFloat(formData.pixAmount) || 0;
    
    const totalCounted = cashAmount + cardAmount + pixAmount;
    const expectedTotal = Number(currentSession.total_sales) + Number(currentSession.initial_amount);
    const difference = totalCounted - expectedTotal;
    
    try {
      setIsSubmitting(true);
      
      await cashierService.closeCashier({
        cash_amount: cashAmount,
        card_amount: cardAmount,
        pix_amount: pixAmount,
        notes: formData.notes || undefined
      });
      
      toast({
        title: "Caixa Fechado!",
        description: `Fechamento realizado com ${difference === 0 ? 'sucesso' : difference > 0 ? 'sobra' : 'falta'} de R$ ${Math.abs(difference).toFixed(2)}.`,
        variant: difference === 0 ? "default" : "destructive",
      });

      navigate("/cashier/history");
    } catch (error: any) {
      console.error('Erro ao fechar caixa:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao fechar o caixa.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  if (!currentSession) {
    return null;
  }

  const cashAmount = parseFloat(formData.cashAmount) || 0;
  const cardAmount = parseFloat(formData.cardAmount) || 0;
  const pixAmount = parseFloat(formData.pixAmount) || 0;
  const totalCounted = cashAmount + cardAmount + pixAmount;
  const expectedTotal = Number(currentSession.total_sales) + Number(currentSession.initial_amount);
  const difference = totalCounted - expectedTotal;
  const expectedCash = Number(currentSession.initial_amount) + Number(currentSession.cash_sales);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Fechamento de Caixa</h1>
        <p className="text-muted-foreground">
          Confira os valores e feche o caixa do dia
        </p>
      </div>

      {/* System Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inicial</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {Number(currentSession.initial_amount).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <Calculator className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {Number(currentSession.total_sales).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dinheiro Esperado</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {expectedCash.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Esperado</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {expectedTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Vendas por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Dinheiro</div>
              <div className="text-2xl font-bold">R$ {Number(currentSession.cash_sales).toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Cartão</div>
              <div className="text-2xl font-bold">R$ {Number(currentSession.card_sales).toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">PIX</div>
              <div className="text-2xl font-bold">R$ {Number(currentSession.pix_sales).toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Counting Form */}
      <Card>
        <CardHeader>
          <CardTitle>Contagem Manual</CardTitle>
          <CardDescription>
            Informe os valores contados fisicamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashAmount">Dinheiro Contado (R$) *</Label>
                <Input
                  id="cashAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cashAmount}
                  onChange={(e) => handleInputChange("cashAmount", e.target.value)}
                  placeholder="0,00"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Esperado: R$ {Number(currentSession.cash_sales).toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardAmount">Cartão Conferido (R$) *</Label>
                <Input
                  id="cardAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cardAmount}
                  onChange={(e) => handleInputChange("cardAmount", e.target.value)}
                  placeholder="0,00"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Esperado: R$ {Number(currentSession.card_sales).toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pixAmount">PIX Conferido (R$) *</Label>
                <Input
                  id="pixAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pixAmount}
                  onChange={(e) => handleInputChange("pixAmount", e.target.value)}
                  placeholder="0,00"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Esperado: R$ {Number(currentSession.pix_sales).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Difference Calculation */}
            <Card className={`${difference === 0 ? 'border-green-200 bg-green-50' : difference > 0 ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      {difference === 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="font-medium">
                        {difference === 0 && "Caixa Conferido"}
                        {difference > 0 && "Sobra no Caixa"}
                        {difference < 0 && "Falta no Caixa"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Total contado: R$ {Number(totalCounted).toFixed(2)} | Esperado: R$ {Number(expectedTotal).toFixed(2)}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${difference === 0 ? 'text-green-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {difference !== 0 && (difference > 0 ? '+' : '')}R$ {Number(difference).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Observações sobre o fechamento, diferenças encontradas, etc..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate("/cashier")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-2" />
                )}
                Fechar Caixa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierClose;
