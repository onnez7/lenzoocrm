
import { useState } from "react";
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
  Search, 
  Filter,
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  Calendar,
  Package,
  ArrowUpDown
} from "lucide-react";

// Mock data para movimentações
const mockMovements = [
  {
    id: "1",
    productName: "Óculos Ray-Ban Aviador",
    sku: "RB3025-001",
    type: "entry" as const,
    quantity: 10,
    reason: "Compra - NF 12345",
    employee: "João Silva",
    date: "2024-01-22T10:30:00",
    previousStock: 5,
    newStock: 15
  },
  {
    id: "2",
    productName: "Armação Oakley OX8156",
    sku: "OAK-8156-02",
    type: "exit" as const,
    quantity: -2,
    reason: "Venda - Pedido #1001",
    employee: "Maria Santos",
    date: "2024-01-21T15:45:00",
    previousStock: 10,
    newStock: 8
  },
  {
    id: "3",
    productName: "Lente de Contato Acuvue",
    sku: "JJ-OASYS-30",
    type: "entry" as const,
    quantity: 20,
    reason: "Compra - NF 12346",
    employee: "João Silva",
    date: "2024-01-20T09:15:00",
    previousStock: 5,
    newStock: 25
  },
  {
    id: "4",
    productName: "Óculos Prada PR 17WS",
    sku: "PR-17WS-1AB",
    type: "exit" as const,
    quantity: -1,
    reason: "Venda - Pedido #1002",
    employee: "Carlos Oliveira",
    date: "2024-01-19T14:20:00",
    previousStock: 4,
    newStock: 3
  },
  {
    id: "5",
    productName: "Armação Chilli Beans",
    sku: "CB-2024-BK",
    type: "adjustment" as const,
    quantity: -3,
    reason: "Ajuste de inventário - Produtos danificados",
    employee: "Maria Santos",
    date: "2024-01-18T11:00:00",
    previousStock: 3,
    newStock: 0
  },
  {
    id: "6",
    productName: "Óculos Ray-Ban Aviador",
    sku: "RB3025-001",
    type: "exit" as const,
    quantity: -1,
    reason: "Venda - Pedido #1003",
    employee: "Ana Costa",
    date: "2024-01-17T16:30:00",
    previousStock: 6,
    newStock: 5
  }
];

const StockMovements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [movements] = useState(mockMovements);

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || movement.type === typeFilter;
    
    return matchesSearch && matchesType;
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

  const totalMovements = filteredMovements.length;
  const entriesCount = filteredMovements.filter(m => m.type === "entry").length;
  const exitsCount = filteredMovements.filter(m => m.type === "exit").length;
  const adjustmentsCount = filteredMovements.filter(m => m.type === "adjustment").length;

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
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="entry">Entradas</SelectItem>
                  <SelectItem value="exit">Saídas</SelectItem>
                  <SelectItem value="adjustment">Ajustes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Funcionário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => {
                const config = getMovementConfig(movement.type, movement.quantity);
                const MovementIcon = config.icon;
                const dateTime = formatDateTime(movement.date);

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
                        <div className="font-medium">{movement.productName}</div>
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
                        <span className="text-muted-foreground">{movement.previousStock}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{movement.newStock}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={movement.reason}>
                        {movement.reason}
                      </div>
                    </TableCell>
                    <TableCell>{movement.employee}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Nenhuma movimentação encontrada</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente ajustar os filtros de busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovements;
