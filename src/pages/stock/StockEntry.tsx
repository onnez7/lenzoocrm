import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Save, Plus, Trash2, Package2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import productService, { Product } from "@/services/productService";
import stockService from "@/services/stockService";
import { useAuth } from "@/contexts/AuthContext";

interface StockEntryItem {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

const StockEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [entryData, setEntryData] = useState({
    supplier: "",
    invoiceNumber: "",
    entryDate: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const [entryItems, setEntryItems] = useState<StockEntryItem[]>([]);
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: "",
    unitCost: "",
  });

  // Carregar produtos
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      let response;
      
      if (user?.role === 'FRANCHISE_ADMIN') {
        response = await productService.getFranchiseProducts(1, 1000, "");
      } else {
        response = await productService.getProducts(1, 1000, "");
      }
      
      setProducts(response.products.filter(p => p.status === "active"));
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitCost) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do item.",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id.toString() === newItem.productId);
    if (!product) return;

    const quantity = parseInt(newItem.quantity);
    const unitCost = parseFloat(newItem.unitCost);
    const totalCost = quantity * unitCost;

    const item: StockEntryItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku || "",
      quantity,
      unitCost,
      totalCost,
    };

    setEntryItems(prev => [...prev, item]);
    setNewItem({ productId: "", quantity: "", unitCost: "" });
  };

  const handleRemoveItem = (index: number) => {
    setEntryItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (entryItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à entrada.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Registrar cada item como uma movimentação separada
      for (const item of entryItems) {
        await stockService.registerMovement({
          product_id: item.productId,
          movement_type: 'entry',
          quantity: item.quantity,
          unit_cost: item.unitCost,
          reason: `Entrada de estoque - ${entryData.invoiceNumber ? `NF: ${entryData.invoiceNumber}` : 'Entrada manual'}`,
          reference_number: entryData.invoiceNumber,
          supplier: entryData.supplier,
          notes: entryData.notes
        });
      }

      toast({
        title: "Entrada registrada!",
        description: `Entrada de estoque com ${entryItems.length} itens foi registrada com sucesso.`,
      });

      navigate("/stock");
    } catch (error: any) {
      console.error('Erro ao registrar entrada:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao registrar entrada de estoque",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalValue = entryItems.reduce((sum, item) => sum + item.totalCost, 0);

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando produtos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/stock")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Entrada de Estoque</h1>
          <p className="text-muted-foreground">
            Registre entradas de produtos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações da Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              Informações da Entrada
            </CardTitle>
            <CardDescription>
              Dados gerais da entrada de estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={entryData.supplier}
                  onChange={(e) => setEntryData(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Número da Nota Fiscal</Label>
                <Input
                  id="invoiceNumber"
                  value={entryData.invoiceNumber}
                  onChange={(e) => setEntryData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="Ex: 12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryDate">Data de Entrada</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={entryData.entryDate}
                  onChange={(e) => setEntryData(prev => ({ ...prev, entryDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={entryData.notes}
                onChange={(e) => setEntryData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre a entrada..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Adicionar Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Produtos</CardTitle>
            <CardDescription>
              Selecione os produtos e quantidades para entrada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select
                  value={newItem.productId}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, productId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.sku || 'Sem SKU'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Custo Unitário</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.unitCost}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unitCost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <Button type="button" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Itens */}
        {entryItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Itens da Entrada</CardTitle>
              <CardDescription>
                {entryItems.length} itens adicionados - Total: R$ {totalValue.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Custo Unitário</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entryItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="font-mono">{item.sku || "—"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>R$ {item.unitCost.toFixed(2)}</TableCell>
                      <TableCell>R$ {item.totalCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/stock")}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || entryItems.length === 0}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Registrar Entrada
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StockEntry;
