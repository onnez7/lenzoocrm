
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Calculator, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CashierClose = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cashAmount: "",
    cardAmount: "",
    pixAmount: "",
    notes: "",
  });

  // Mock data - valores do sistema
  const systemData = {
    initialAmount: 100.00,
    cashSales: 450.00,
    cardSales: 1250.00,
    pixSales: 680.00,
    totalSales: 2380.00,
    expectedCash: 550.00, // inicial + vendas em dinheiro
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cashAmount = parseFloat(formData.cashAmount) || 0;
    const cardAmount = parseFloat(formData.cardAmount) || 0;
    const pixAmount = parseFloat(formData.pixAmount) || 0;
    
    const totalCounted = cashAmount + cardAmount + pixAmount;
    const difference = totalCounted - systemData.totalSales - systemData.initialAmount;
    
    toast({
      title: "Caixa Fechado!",
      description: `Fechamento realizado com ${difference === 0 ? 'sucesso' : difference > 0 ? 'sobra' : 'falta'} de R$ ${Math.abs(difference).toFixed(2)}.`,
      variant: difference === 0 ? "default" : "destructive",
    });

    navigate("/cashier/history");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const cashAmount = parseFloat(formData.cashAmount) || 0;
  const cardAmount = parseFloat(formData.cardAmount) || 0;
  const pixAmount = parseFloat(formData.pixAmount) || 0;
  const totalCounted = cashAmount + cardAmount + pixAmount;
  const expectedTotal = systemData.totalSales + systemData.initialAmount;
  const difference = totalCounted - expectedTotal;

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
              R$ {systemData.initialAmount.toFixed(2)}
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
              R$ {systemData.totalSales.toFixed(2)}
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
              R$ {systemData.expectedCash.toFixed(2)}
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
              <div className="text-2xl font-bold">R$ {systemData.cashSales.toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Cartão</div>
              <div className="text-2xl font-bold">R$ {systemData.cardSales.toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">PIX</div>
              <div className="text-2xl font-bold">R$ {systemData.pixSales.toFixed(2)}</div>
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
                  Esperado: R$ {systemData.expectedCash.toFixed(2)}
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
                  Esperado: R$ {systemData.cardSales.toFixed(2)}
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
                  Esperado: R$ {systemData.pixSales.toFixed(2)}
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
                      Total contado: R$ {totalCounted.toFixed(2)} | Esperado: R$ {expectedTotal.toFixed(2)}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${difference === 0 ? 'text-green-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {difference !== 0 && (difference > 0 ? '+' : '')}R$ {difference.toFixed(2)}
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
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                <DollarSign className="h-4 w-4 mr-2" />
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
