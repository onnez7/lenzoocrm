import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  User,
  Calendar,
  DollarSign,
  Package
} from "lucide-react";
import { orderService, ServiceOrder } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!id || isNaN(parseInt(id))) {
        setIsLoading(false);
        toast({
          title: "Erro",
          description: "ID da ordem inválido.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const orderData = await orderService.getOrder(parseInt(id));
        setOrder(orderData);
        setNewStatus(orderData.status);
      } catch (error) {
        console.error('Erro ao carregar ordem:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar os detalhes da ordem.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id, toast]);

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;

    try {
      const updatedOrder = await orderService.updateStatus(order.id, newStatus as ServiceOrder['status']);
      setOrder(updatedOrder);
      setIsStatusDialogOpen(false);
      toast({
        title: "Status Atualizado",
        description: "O status da ordem foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o status da ordem.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!order) return;

    try {
      await orderService.deleteOrder(order.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Ordem Deletada",
        description: "A ordem foi deletada com sucesso.",
      });
      navigate("/orders");
    } catch (error) {
      console.error('Erro ao deletar ordem:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar a ordem.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Concluída</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Carregando detalhes da ordem...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Ordem não encontrada.</div>
          <Button asChild className="mt-4">
            <Link to="/orders">Voltar para Lista</Link>
          </Button>
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
            <h1 className="text-3xl font-bold">Ordem de Serviço</h1>
            <p className="text-muted-foreground">
              Detalhes da ordem {order.order_number}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsStatusDialogOpen(true)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Alterar Status
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/orders/edit/${order.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {getStatusIcon(order.status)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusBadge(order.status)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {order.total_amount.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {order.items?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Ordem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Número da OS</div>
              <div className="font-medium">{order.order_number}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Data de Criação</div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Última Atualização</div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            {order.description && (
              <div>
                <div className="text-sm text-muted-foreground">Descrição</div>
                <div className="font-medium">{order.description}</div>
              </div>
            )}
            {order.notes && (
              <div>
                <div className="text-sm text-muted-foreground">Observações</div>
                <div className="font-medium">{order.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente e Funcionário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Cliente</div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{order.client_name}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Funcionário Responsável</div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{order.employee_name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens da Ordem</CardTitle>
          <CardDescription>
            Produtos e serviços incluídos nesta ordem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unitário</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>R$ {item.unit_price.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">
                    R$ {item.total_price.toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status da Ordem</DialogTitle>
            <DialogDescription>
              Selecione o novo status para a ordem {order.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusUpdate}>
              Atualizar Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a ordem {order.order_number}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetails; 