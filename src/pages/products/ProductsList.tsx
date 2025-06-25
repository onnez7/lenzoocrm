
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data para produtos
const mockProducts = [
  {
    id: "1",
    name: "Óculos Ray-Ban Aviador",
    brand: "Ray-Ban",
    model: "RB3025",
    sku: "RB3025-001",
    price: 450.00,
    cost: 200.00,
    currentStock: 15,
    minStock: 5,
    category: "Óculos de Sol",
    status: "active"
  },
  {
    id: "2",
    name: "Armação Oakley OX8156",
    brand: "Oakley",
    model: "OX8156",
    sku: "OAK-8156-02",
    price: 380.00,
    cost: 180.00,
    currentStock: 8,
    minStock: 10,
    category: "Armações",
    status: "active"
  },
  {
    id: "3",
    name: "Lente de Contato Acuvue",
    brand: "Johnson & Johnson",
    model: "Oasys",
    sku: "JJ-OASYS-30",
    price: 85.00,
    cost: 45.00,
    currentStock: 25,
    minStock: 15,
    category: "Lentes de Contato",
    status: "active"
  },
  {
    id: "4",
    name: "Óculos Prada PR 17WS",
    brand: "Prada",
    model: "PR 17WS",
    sku: "PR-17WS-1AB",
    price: 850.00,
    cost: 400.00,
    currentStock: 3,
    minStock: 5,
    category: "Óculos de Sol",
    status: "active"
  },
  {
    id: "5",
    name: "Armação Chilli Beans",
    brand: "Chilli Beans",
    model: "CB2024",
    sku: "CB-2024-BK",
    price: 150.00,
    cost: 75.00,
    currentStock: 0,
    minStock: 8,
    category: "Armações",
    status: "inactive"
  }
];

const ProductsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products] = useState(mockProducts);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { label: "Sem Estoque", variant: "destructive" as const };
    if (currentStock <= minStock) return { label: "Estoque Baixo", variant: "outline" as const };
    return { label: "Em Estoque", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e óculos
          </p>
        </div>
        <Button onClick={() => navigate("/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Produtos
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.currentStock, product.minStock);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.brand}</div>
                        <div className="text-sm text-muted-foreground">{product.model}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{product.sku}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">R$ {product.price.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          Custo: R$ {product.cost.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {product.currentStock} / Min: {product.minStock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/products/${product.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente ajustar os termos de busca ou adicione um novo produto.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsList;
