import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  DollarSign, 
  Package, 
  User, 
  Calendar,
  Clock,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { orderService, ServiceOrder, CreateOrderData } from "@/services/orderService";
import { clientService } from "@/services/clientService";
import productService from "@/services/productService";
import { cashierService } from "@/services/cashierService";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Product {
  id: number;
  name: string;
  price: number | string;
  category_name?: string;
}

interface OrderItem {
  id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const OrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    client_id: "",
    order_number: "",
    notes: "",
    delivery_date: "",
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [cashierOpen, setCashierOpen] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    console.log('OrderForm: Iniciando carregamento de dados...');
    console.log('OrderForm: Token no localStorage:', localStorage.getItem('lenzooToken') ? 'Presente' : 'Ausente');
    loadInitialData();
  }, []);

  // Carregar ordem se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      loadOrder();
    }
  }, [isEditing, id]);

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true);
      
      // Carregar clientes
      const clientsResponse = await clientService.getAllClients({ page: 1, limit: 100 });
      setClients(clientsResponse.clients);
      
      // Carregar produtos baseado no papel do usuário
      console.log('OrderForm: Papel do usuário:', user?.role);
      let productsResponse;
      
      if (user?.role === 'SUPER_ADMIN') {
        productsResponse = await productService.getProducts(1, 100);
      } else {
        // Para FRANCHISE_ADMIN e EMPLOYEE, usar a rota da franquia
        productsResponse = await productService.getFranchiseProducts(1, 100);
      }
      
      setProducts(productsResponse.products);
      
      // Verificar se o caixa está aberto
      try {
        const cashierResponse = await cashierService.checkOpenSession();
        setCashierOpen(!!cashierResponse.session);
      } catch (error) {
        setCashierOpen(false);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados iniciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadOrder = async () => {
    if (!id || isNaN(parseInt(id))) return;
    
    try {
      setIsLoadingData(true);
      const order = await orderService.getOrder(parseInt(id));
      
      setFormData({
        client_id: order.client_id.toString(),
        order_number: order.order_number,
        notes: order.notes || "",
        delivery_date: "",
      });
      
      if (order.items) {
        setOrderItems(order.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar ordem:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da ordem.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cashierOpen) {
      toast({
        title: "Caixa Fechado",
        description: "É necessário abrir o caixa antes de criar uma ordem de serviço.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.client_id) {
      toast({
        title: "Cliente Obrigatório",
        description: "Selecione um cliente para a ordem.",
        variant: "destructive",
      });
      return;
    }
    
    if (orderItems.length === 0) {
      toast({
        title: "Itens Obrigatórios",
        description: "Adicione pelo menos um item à ordem.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const orderData: CreateOrderData = {
        client_id: parseInt(formData.client_id),
        notes: formData.notes || undefined,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      };
      
      if (isEditing) {
        await orderService.updateOrder(parseInt(id), orderData);
        toast({
          title: "Ordem Atualizada",
          description: "A ordem foi atualizada com sucesso.",
        });
      } else {
        await orderService.createOrder(orderData);
        toast({
          title: "Ordem Criada",
          description: "A ordem foi criada com sucesso.",
        });
      }
      
      navigate("/orders");
    } catch (error: any) {
      console.error('Erro ao salvar ordem:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar a ordem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    const newItem: OrderItem = {
      product_id: 0,
      product_name: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calcular preço total do item
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    // Atualizar nome do produto se o produto foi selecionado
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].product_name = product.name;
        updatedItems[index].unit_price = Number(product.price);
        updatedItems[index].total_price = updatedItems[index].quantity * Number(product.price);
      }
    }
    
    setOrderItems(updatedItems);
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + Number(item.total_price), 0);

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Edite os detalhes da ordem" : "Crie uma nova ordem de serviço"}
            </p>
          </div>
        </div>
      </div>

      {/* Cashier Status Warning */}
      {!cashierOpen && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-800">
                  <strong>Atenção:</strong> O caixa está fechado. É necessário abrir o caixa antes de criar uma ordem de serviço.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate("/cashier/open")}
                >
                  Abrir Caixa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente *</Label>
                    <Select 
                      value={formData.client_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              <div>
                                <div>{client.name}</div>
                                <div className="text-xs text-muted-foreground">{client.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Data de Entrega</Label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações sobre a ordem..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Itens da Ordem</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addItem}
                    disabled={!cashierOpen}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Produto *</Label>
                            <Select 
                              value={item.product_id.toString()} 
                              onValueChange={(value) => updateItem(index, 'product_id', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    <div className="flex items-center">
                                      <Package className="mr-2 h-4 w-4" />
                                      <div>
                                        <div>{product.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          R$ {Number(product.price).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Quantidade *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Preço Unitário (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Total (R$)</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                value={item.total_price.toFixed(2)}
                                readOnly
                                className="font-medium"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Ordem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total de Itens:</span>
                  <span className="font-medium">{orderItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || !cashierOpen}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Package className="h-4 w-4 mr-2" />
                    )}
                    {isEditing ? "Atualizar Ordem" : "Criar Ordem"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/orders")}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderForm; 