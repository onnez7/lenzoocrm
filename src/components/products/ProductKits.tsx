
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Package, Trash2, Edit, Eye } from "lucide-react";

interface ProductKit {
  id: string;
  name: string;
  description: string;
  products: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  discountPrice: number;
  isActive: boolean;
}

const mockProducts = [
  { id: "1", name: "Óculos Ray-Ban Aviador", price: 450.00 },
  { id: "2", name: "Estojo Premium", price: 45.00 },
  { id: "3", name: "Kit Limpeza", price: 25.00 },
  { id: "4", name: "Cordinha Ajustável", price: 15.00 },
  { id: "5", name: "Pano de Microfibra", price: 10.00 }
];

const mockKits: ProductKit[] = [
  {
    id: "1",
    name: "Kit Completo Ray-Ban",
    description: "Óculos Ray-Ban com todos os acessórios",
    products: [
      { id: "1", name: "Óculos Ray-Ban Aviador", quantity: 1, price: 450.00 },
      { id: "2", name: "Estojo Premium", quantity: 1, price: 45.00 },
      { id: "3", name: "Kit Limpeza", quantity: 1, price: 25.00 },
      { id: "5", name: "Pano de Microfibra", quantity: 2, price: 10.00 }
    ],
    totalPrice: 540.00,
    discountPrice: 485.00,
    isActive: true
  },
  {
    id: "2",
    name: "Kit Básico de Cuidados",
    description: "Kit essencial para cuidado dos óculos",
    products: [
      { id: "3", name: "Kit Limpeza", quantity: 1, price: 25.00 },
      { id: "4", name: "Cordinha Ajustável", quantity: 1, price: 15.00 },
      { id: "5", name: "Pano de Microfibra", quantity: 3, price: 10.00 }
    ],
    totalPrice: 70.00,
    discountPrice: 59.90,
    isActive: true
  }
];

export function ProductKits() {
  const [kits, setKits] = useState<ProductKit[]>(mockKits);
  const [isCreatingKit, setIsCreatingKit] = useState(false);
  const [newKit, setNewKit] = useState({
    name: "",
    description: "",
    discountPrice: 0
  });
  const [selectedProducts, setSelectedProducts] = useState<{id: string, quantity: number}[]>([]);

  const addProductToKit = (productId: string) => {
    const existing = selectedProducts.find(p => p.id === productId);
    if (existing) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { id: productId, quantity: 1 }]);
    }
  };

  const removeProductFromKit = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromKit(productId);
    } else {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === productId ? { ...p, quantity } : p
      ));
    }
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, sp) => {
      const product = mockProducts.find(p => p.id === sp.id);
      return total + (product ? product.price * sp.quantity : 0);
    }, 0);
  };

  const createKit = () => {
    if (newKit.name && selectedProducts.length > 0) {
      const kitProducts = selectedProducts.map(sp => {
        const product = mockProducts.find(p => p.id === sp.id)!;
        return {
          id: product.id,
          name: product.name,
          quantity: sp.quantity,
          price: product.price
        };
      });

      const kit: ProductKit = {
        id: (kits.length + 1).toString(),
        name: newKit.name,
        description: newKit.description,
        products: kitProducts,
        totalPrice: calculateTotalPrice(),
        discountPrice: newKit.discountPrice || calculateTotalPrice(),
        isActive: true
      };

      setKits([...kits, kit]);
      setNewKit({ name: "", description: "", discountPrice: 0 });
      setSelectedProducts([]);
      setIsCreatingKit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Kits de Produtos</h2>
          <p className="text-muted-foreground">
            Crie e gerencie kits de produtos com descontos especiais
          </p>
        </div>
        <Button onClick={() => setIsCreatingKit(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Kit
        </Button>
      </div>

      {isCreatingKit && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Kit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kitName">Nome do Kit</Label>
                <Input
                  id="kitName"
                  value={newKit.name}
                  onChange={(e) => setNewKit({ ...newKit, name: e.target.value })}
                  placeholder="Ex: Kit Completo Premium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Preço Promocional</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  value={newKit.discountPrice}
                  onChange={(e) => setNewKit({ ...newKit, discountPrice: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kitDescription">Descrição</Label>
              <Input
                id="kitDescription"
                value={newKit.description}
                onChange={(e) => setNewKit({ ...newKit, description: e.target.value })}
                placeholder="Descrição do kit..."
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Adicionar Produtos ao Kit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Produtos Disponíveis</Label>
                  <div className="space-y-2 mt-2">
                    {mockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            R$ {product.price.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addProductToKit(product.id)}
                          disabled={selectedProducts.some(p => p.id === product.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Produtos no Kit</Label>
                  <div className="space-y-2 mt-2">
                    {selectedProducts.map((sp) => {
                      const product = mockProducts.find(p => p.id === sp.id)!;
                      return (
                        <div key={sp.id} className="flex items-center justify-between p-2 border rounded bg-blue-50">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              R$ {product.price.toFixed(2)} x {sp.quantity}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={sp.quantity}
                              onChange={(e) => updateProductQuantity(sp.id, parseInt(e.target.value))}
                              className="w-16 h-8"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeProductFromKit(sp.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedProducts.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <div className="text-sm">
                        <div>Total Normal: R$ {calculateTotalPrice().toFixed(2)}</div>
                        <div className="font-bold text-green-600">
                          Preço do Kit: R$ {(newKit.discountPrice || calculateTotalPrice()).toFixed(2)}
                        </div>
                        {newKit.discountPrice > 0 && newKit.discountPrice < calculateTotalPrice() && (
                          <div className="text-green-600">
                            Economia: R$ {(calculateTotalPrice() - newKit.discountPrice).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createKit} disabled={!newKit.name || selectedProducts.length === 0}>
                Criar Kit
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingKit(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Kits Existentes
          </CardTitle>
          <CardDescription>
            {kits.filter(k => k.isActive).length} kits ativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Kit</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Preço Normal</TableHead>
                <TableHead>Preço do Kit</TableHead>
                <TableHead>Economia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kits.map((kit) => (
                <TableRow key={kit.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{kit.name}</div>
                      <div className="text-sm text-muted-foreground">{kit.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {kit.products.length} itens
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {kit.totalPrice.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    R$ {kit.discountPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    R$ {(kit.totalPrice - kit.discountPrice).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={kit.isActive ? "default" : "secondary"}>
                      {kit.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
