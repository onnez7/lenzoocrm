import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Clock, User, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cashierService } from "@/services/cashierService";
import employeeService from "@/services/employeeService";

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
}

const CashierOpen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    employeeId: "",
    initialAmount: "",
    notes: "",
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  // Carregar funcionários
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await employeeService.getFranchiseEmployees(1, 100);
      setEmployees(response.employees);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de funcionários.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.initialAmount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await cashierService.openCashier({
        employee_id: parseInt(formData.employeeId),
        initial_amount: parseFloat(formData.initialAmount),
        notes: formData.notes || undefined
      });
      
      toast({
        title: "Caixa Aberto!",
        description: "O caixa foi aberto com sucesso.",
      });

      navigate("/cashier");
    } catch (error: any) {
      console.error('Erro ao abrir caixa:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao abrir o caixa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Abertura de Caixa</h1>
        <p className="text-muted-foreground">
          Abra o caixa para iniciar as vendas do dia
        </p>
      </div>

      {/* Current Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Atual</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentDate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horário</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Fechado</div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Abertura de Caixa</CardTitle>
          <CardDescription>
            Preencha as informações para abrir o caixa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Funcionário Responsável *</Label>
                {isLoadingEmployees ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Carregando funcionários...</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.employeeId} 
                    onValueChange={(value) => handleInputChange("employeeId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg">
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            <div>
                              <div>{employee.name}</div>
                              <div className="text-xs text-muted-foreground">{employee.position}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialAmount">Valor Inicial (R$) *</Label>
                <Input
                  id="initialAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.initialAmount}
                  onChange={(e) => handleInputChange("initialAmount", e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Observações sobre a abertura (opcional)"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate("/cashier")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading || isLoadingEmployees}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-2" />
                )}
                Abrir Caixa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Após abrir o caixa, todas as vendas do dia serão registradas nesta sessão. 
                Certifique-se de conferir o valor inicial em dinheiro antes de prosseguir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierOpen;
