import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Package, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/config/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock: number;
  category: string;
  brand: string;
  sku: string;
  franchise_id: number;
  franchise_name: string;
  created_at: string;
}

const AdminProducts = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    cost: '', 
    stock_quantity: '', 
    min_stock: '', 
    category: '', 
    brand: '', 
    sku: '',
    targetFranchiseId: ''
  });
  const { toast } = useToast();

  // Verificar se o usuário é SUPER_ADMIN
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      toast({ 
        title: 'Acesso Negado', 
        description: 'Apenas administradores matriz podem acessar esta área.', 
        variant: 'destructive' 
      });
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);

  // Se não for SUPER_ADMIN, não renderiza nada
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  // Buscar produtos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(apiUrl('/products'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        toast({ title: 'Erro', description: 'Erro ao buscar produtos', variant: 'destructive' });
      }
    };
    fetchProducts();
  }, [token, toast]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.franchise_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers para criar produto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        cost: form.cost ? parseFloat(form.cost) : null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        min_stock: parseInt(form.min_stock) || 0,
        category: form.category,
        brand: form.brand,
        sku: form.sku,
        targetFranchiseId: parseInt(form.targetFranchiseId)
      };
      
      const res = await fetch(apiUrl('/products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const error = await res.json();
        toast({ title: 'Erro', description: error.message || 'Erro ao criar produto', variant: 'destructive' });
        return;
      }
      
      toast({ title: 'Produto criado', description: 'Produto criado com sucesso!' });
      setOpen(false);
      setForm({ name: '', description: '', price: '', cost: '', stock_quantity: '', min_stock: '', category: '', brand: '', sku: '', targetFranchiseId: '' });
      
      // Atualiza lista
      const data = await res.json();
      setProducts(prev => [...prev, data]);
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao criar produto', variant: 'destructive' });
    }
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) {
      return { badge: <Badge className="bg-red-100 text-red-800">Sem Estoque</Badge>, icon: <AlertTriangle className="h-4 w-4 text-red-600" /> };
    } else if (quantity <= minStock) {
      return { badge: <Badge className="bg-yellow-100 text-yellow-800">Estoque Baixo</Badge>, icon: <AlertTriangle className="h-4 w-4 text-yellow-600" /> };
    } else {
      return { badge: <Badge className="bg-green-100 text-green-800">Em Estoque</Badge>, icon: <CheckCircle className="h-4 w-4 text-green-600" /> };
    }
  };

  // Métricas
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.min_stock).length;
  const outOfStockProducts = products.filter(p => p.stock_quantity <= 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie todos os produtos de todas as franquias</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
              <DialogDescription>Preencha os dados para criar um novo produto.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 py-4" onSubmit={handleCreateProduct}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" value={form.sku} onChange={handleInputChange} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" name="description" value={form.description} onChange={handleInputChange} />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Preço de Venda</Label>
                  <Input id="price" name="price" type="number" step="0.01" value={form.price} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="cost">Custo</Label>
                  <Input id="cost" name="cost" type="number" step="0.01" value={form.cost} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="targetFranchiseId">Franquia ID</Label>
                  <Input id="targetFranchiseId" name="targetFranchiseId" type="number" value={form.targetFranchiseId} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
                  <Input id="stock_quantity" name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="min_stock">Estoque Mínimo</Label>
                  <Input id="min_stock" name="min_stock" type="number" value={form.min_stock} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" name="category" value={form.category} onChange={handleInputChange} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" name="brand" value={form.brand} onChange={handleInputChange} />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">Salvar Produto</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, SKU ou franquia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Gerencie todos os produtos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Franquia</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity, product.min_stock);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.sku && `SKU: ${product.sku}`}
                          {product.brand && ` • ${product.brand}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.franchise_name || `Franquia ${product.franchise_id}`}</TableCell>
                    <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {stockStatus.icon}
                        <span>{product.stock_quantity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{stockStatus.badge}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts; 