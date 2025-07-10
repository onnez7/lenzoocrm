import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter,
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  Calendar,
  Package,
  ArrowUpDown,
  Eye,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import stockService, { StockMovement } from "@/services/stockService";
import { useAuth } from "@/contexts/AuthContext";

const StockMovements = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 100,
        offset: 0
      };

      if (typeFilter !== "all") {
        params.movement_type = typeFilter;
      }
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }

      const movementsData = await stockService.listMovements(params);
      setMovements(movementsData);
    } catch (error: any) {
      console.error('Erro ao carregar movimentações:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao carregar movimentações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [typeFilter, startDate, endDate]);

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getMovementConfig = (type: string, quantity: number) => {
    switch (type) {
      case "entry":
        return {
          label: "Entrada",
          variant: "default" as const,
          icon: TrendingUp,
          color: "text-green-600",
          sign: "+"
        };
      case "exit":
        return {
          label: "Saída",
          variant: "destructive" as const,
          icon: TrendingDown,
          color: "text-red-600",
          sign: ""
        };
      case "adjustment":
        return {
          label: "Ajuste",
          variant: "outline" as const,
          icon: RotateCcw,
          color: quantity > 0 ? "text-green-600" : "text-red-600",
          sign: quantity > 0 ? "+" : ""
        };
      case "transfer":
        return {
          label: "Transferência",
          variant: "secondary" as const,
          icon: ArrowUpDown,
          color: "text-blue-600",
          sign: ""
        };
      default:
        return {
          label: "Desconhecido",
          variant: "secondary" as const,
          icon: Package,
          color: "text-gray-600",
          sign: ""
        };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleViewDetails = async (movement: StockMovement) => {
    try {
      const detailedMovement = await stockService.getMovementById(movement.id);
      setSelectedMovement(detailedMovement);
      setIsDetailDialogOpen(true);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes da movimentação:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes da movimentação",
        variant: "destructive",
      });
    }
  };

  const totalMovements = filteredMovements.length;
  const entriesCount = filteredMovements.filter(m => m.movement_type === "entry").length;
  const exitsCount = filteredMovements.filter(m => m.movement_type === "exit").length;
  const adjustmentsCount = filteredMovements.filter(m => m.movement_type === "adjustment").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
        <p className="text-muted-foreground">
          Histórico de movimentações
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovements}</div>
            <p className="text-xs text-muted-foreground">movimentações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{entriesCount}</div>
            <p className="text-xs text-muted-foreground">entradas de estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{exitsCount}</div>
            <p className="text-xs text-muted-foreground">saídas de estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
            <RotateCcw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adjustmentsCount}</div>
            <p className="text-xs text-muted-foreground">ajustes realizados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Movimentações
          </CardTitle>
          <CardDescription>
            {filteredMovements.length} movimentações encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por produto, SKU ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="entry">Entradas</SelectItem>
                  <SelectItem value="exit">Saídas</SelectItem>
                  <SelectItem value="adjustment">Ajustes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Data inicial"
                className="w-40"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Data final"
                className="w-40"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Limpar Filtros
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando movimentações...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => {
                    const config = getMovementConfig(movement.movement_type, movement.quantity);
                    const MovementIcon = config.icon;
                    const dateTime = formatDateTime(movement.movement_date);

                    return (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{dateTime.date}</div>
                            <div className="text-sm text-muted-foreground">{dateTime.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{movement.product_name}</div>
                            <div className="text-sm text-muted-foreground font-mono">{movement.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                            <MovementIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${config.color}`}>
                            {config.sign}{Math.abs(movement.quantity)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-muted-foreground">{movement.previous_stock}</span>
                            <span className="mx-1">→</span>
                            <span className="font-medium">{movement.new_stock}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={movement.reason}>
                            {movement.reason}
                          </div>
                        </TableCell>
                        <TableCell>{movement.user_name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(movement)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredMovements.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Nenhuma movimentação encontrada</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tente ajustar os filtros de busca.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Movimentação</DialogTitle>
            <DialogDescription>
              Informações completas da movimentação de estoque
            </DialogDescription>
          </DialogHeader>
          {selectedMovement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Produto</label>
                  <p className="font-medium">{selectedMovement.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="font-mono">{selectedMovement.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <Badge variant={getMovementConfig(selectedMovement.movement_type, selectedMovement.quantity).variant}>
                    {getMovementConfig(selectedMovement.movement_type, selectedMovement.quantity).label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantidade</label>
                  <p className="font-medium">{selectedMovement.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estoque Anterior</label>
                  <p>{selectedMovement.previous_stock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Novo Estoque</label>
                  <p className="font-medium">{selectedMovement.new_stock}</p>
                </div>
                {selectedMovement.unit_cost && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Custo Unitário</label>
                    <p>{formatCurrency(selectedMovement.unit_cost)}</p>
                  </div>
                )}
                {selectedMovement.total_cost && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Custo Total</label>
                    <p>{formatCurrency(selectedMovement.total_cost)}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Motivo</label>
                <p>{selectedMovement.reason || "—"}</p>
              </div>
              
              {selectedMovement.reference_number && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número de Referência</label>
                  <p>{selectedMovement.reference_number}</p>
                </div>
              )}
              
              {selectedMovement.supplier && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fornecedor</label>
                  <p>{selectedMovement.supplier}</p>
                </div>
              )}
              
              {selectedMovement.customer && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                  <p>{selectedMovement.customer}</p>
                </div>
              )}
              
              {selectedMovement.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p>{selectedMovement.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usuário</label>
                  <p>{selectedMovement.user_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data/Hora</label>
                  <p>{formatDateTime(selectedMovement.movement_date).date} às {formatDateTime(selectedMovement.movement_date).time}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockMovements;
