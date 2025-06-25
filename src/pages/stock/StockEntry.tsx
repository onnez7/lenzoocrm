
import { useState } from "react";
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
import { ArrowLeft, Save, Plus, Trash2, Package2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data para produtos disponíveis
const mockProducts = [
  { id: "1", name: "Óculos Ray-Ban Aviador", sku: "RB3025-001", price: 200.00 },
  { id: "2", name: "Armação Oakley OX8156", sku: "OAK-8156-02", price: 180.00 },
  { id: "3", name: "Lente de Contato Acuvue", sku: "JJ-OASYS-30", price: 45.00 },
  { id: "4", name: "Óculos Prada PR 17WS", sku: "PR-17WS-1AB", price: 400.00 },
];

interface StockEntryItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

const StockEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitCost) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do item.",
        variant: "destructive",
      });
      return;
    }

    const product = mockProducts.find(p => p.id === newItem.productId);
    if (!product) return;

    const quantity = parseInt(newItem.quantity);
    const unitCost = parseFloat(newItem.unitCost);
    const totalCost = quantity * unitCost;

    const item: StockEntryItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (entryItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à entrada.",
        variant: "destructive",
      });
      return;
    }

    // Simular salvamento
    toast({
      title: "Entrada registrada!",
      description: `Entrada de estoque com ${entryItems.length} itens foi registrada com sucesso.`,
    });

    navigate("/stock");
  };

  const totalValue = entryItems.reduce((sum, item) => sum + item.totalCost, 0);

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
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
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
                      <TableCell className="font-mono">{item.sku}</TableCell>
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
          >
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Registrar Entrada
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StockEntry;
