
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
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Minus, 
  Package, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data para estoque
const mockStockData = [
  {
    id: "1",
    productName: "Óculos Ray-Ban Aviador",
    sku: "RB3025-001",
    brand: "Ray-Ban",
    currentStock: 15,
    minStock: 5,
    lastMovement: "2024-01-20",
    movementType: "entry" as const,
    price: 450.00,
    totalValue: 6750.00
  },
  {
    id: "2",
    productName: "Armação Oakley OX8156",
    sku: "OAK-8156-02",
    brand: "Oakley",
    currentStock: 8,
    minStock: 10,
    lastMovement: "2024-01-18",
    movementType: "exit" as const,
    price: 380.00,
    totalValue: 3040.00
  },
  {
    id: "3",
    productName: "Lente de Contato Acuvue",
    sku: "JJ-OASYS-30",
    brand: "Johnson & Johnson",
    currentStock: 25,
    minStock: 15,
    lastMovement: "2024-01-22",
    movementType: "entry" as const,
    price: 85.00,
    totalValue: 2125.00
  },
  {
    id: "4",
    productName: "Óculos Prada PR 17WS",
    sku: "PR-17WS-1AB",
    brand: "Prada",
    currentStock: 3,
    minStock: 5,
    lastMovement: "2024-01-15",
    movementType: "exit" as const,
    price: 850.00,
    totalValue: 2550.00
  },
  {
    id: "5",
    productName: "Armação Chilli Beans",
    sku: "CB-2024-BK",
    brand: "Chilli Beans",
    currentStock: 0,
    minStock: 8,
    lastMovement: "2024-01-10",
    movementType: "exit" as const,
    price: 150.00,
    totalValue: 0.00
  }
];

const Stock = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stockData] = useState(mockStockData);

  const filteredStock = stockData.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { 
      label: "Sem Estoque", 
      variant: "destructive" as const, 
      icon: AlertTriangle 
    };
    if (currentStock <= minStock) return { 
      label: "Estoque Baixo", 
      variant: "outline" as const, 
      icon: AlertTriangle 
    };
    return { 
      label: "Em Estoque", 
      variant: "default" as const, 
      icon: Package 
    };
  };

  const totalStockValue = filteredStock.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = filteredStock.filter(item => item.currentStock <= item.minStock);
  const outOfStockItems = filteredStock.filter(item => item.currentStock === 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie o estoque dos seus produtos
          </p>
        </div>
        <Button onClick={() => navigate("/stock/entry")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Entrada
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStock.length}</div>
            <p className="text-xs text-muted-foreground">produtos em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalStockValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">valor do estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">produtos com estoque baixo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">produtos sem estoque</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estoque Atual
          </CardTitle>
          <CardDescription>
            {filteredStock.length} produtos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos por nome, marca ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Última Movimentação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.map((item) => {
                const stockStatus = getStockStatus(item.currentStock, item.minStock);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">{item.brand}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{item.sku}</TableCell>
                    <TableCell>
                      <span className="font-medium">{item.currentStock}</span>
                    </TableCell>
                    <TableCell>{item.minStock}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                    <TableCell>R$ {item.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.movementType === "entry" ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-sm">{item.lastMovement}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/stock/entry")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Entrada
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/stock/movements")}>
                            <Minus className="mr-2 h-4 w-4" />
                            Saída
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/stock/movements")}>
                            <Package className="mr-2 h-4 w-4" />
                            Ver Movimentações
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredStock.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente ajustar os termos de busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stock;
