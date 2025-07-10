import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  TrendingDown,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import productService, { Product } from "@/services/productService";
import { useAuth } from "@/contexts/AuthContext";

const Stock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user?.role === 'FRANCHISE_ADMIN') {
        response = await productService.getFranchiseProducts(1, 1000, "");
      } else {
        response = await productService.getProducts(1, 1000, "");
      }
      
      setProducts(response.products);
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user?.role]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalStockValue = filteredProducts.reduce((sum, product) => {
    const cost = product.cost || 0;
    return sum + (cost * product.stock_quantity);
  }, 0);

  const lowStockItems = filteredProducts.filter(product => 
    product.stock_quantity <= product.min_stock && product.stock_quantity > 0
  );
  const outOfStockItems = filteredProducts.filter(product => product.stock_quantity === 0);

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
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
            <p className="text-xs text-muted-foreground">produtos em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStockValue)}</div>
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
            {filteredProducts.length} produtos encontrados
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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando estoque...</span>
            </div>
          ) : (
            <>
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
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock_quantity, product.min_stock);
                    const StatusIcon = stockStatus.icon;
                    const totalValue = (product.cost || 0) * product.stock_quantity;
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.brand_name || "—"}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{product.sku || "—"}</TableCell>
                        <TableCell>
                          <span className="font-medium">{product.stock_quantity}</span>
                        </TableCell>
                        <TableCell>{product.min_stock}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.cost ? formatCurrency(product.cost) : "—"}</TableCell>
                        <TableCell>{formatCurrency(totalValue)}</TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {product.updated_at ? new Date(product.updated_at).toLocaleDateString('pt-BR') : "—"}
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
                              <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
                                Ver Produto
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Nenhum produto encontrado</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tente ajustar os termos de busca.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stock;
