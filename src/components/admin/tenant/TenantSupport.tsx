
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature' | 'bug' | 'other';
  createdAt: Date;
  updatedAt: Date;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  message: string;
  isFromSupport: boolean;
  createdAt: Date;
  author: string;
}

export function TenantSupport() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      title: 'Problema na sincronização de estoque',
      description: 'O estoque não está sendo atualizado corretamente após as vendas.',
      status: 'open',
      priority: 'high',
      category: 'technical',
      createdAt: new Date('2024-06-20'),
      updatedAt: new Date('2024-06-20'),
      responses: [
        {
          id: '1',
          message: 'Estamos investigando o problema. Nossa equipe técnica já foi notificada.',
          isFromSupport: true,
          createdAt: new Date('2024-06-20'),
          author: 'Suporte Técnico'
        }
      ]
    },
    {
      id: '2',
      title: 'Dúvida sobre relatórios',
      description: 'Como gerar relatório de vendas por período?',
      status: 'resolved',
      priority: 'medium',
      category: 'feature',
      createdAt: new Date('2024-06-18'),
      updatedAt: new Date('2024-06-19'),
      responses: [
        {
          id: '2',
          message: 'Você pode gerar relatórios acessando Menu > Relatórios > Vendas. Lá você pode filtrar por período.',
          isFromSupport: true,
          createdAt: new Date('2024-06-19'),
          author: 'Suporte'
        }
      ]
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'technical' as const
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) {
      toast({
        title: "Erro",
        description: "Título e descrição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const ticket: SupportTicket = {
      id: Date.now().toString(),
      ...newTicket,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: []
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({
      title: '',
      description: '',
      priority: 'medium',
      category: 'technical'
    });
    setIsDialogOpen(false);

    toast({
      title: "Ticket criado",
      description: "Seu ticket foi criado com sucesso. Nossa equipe entrará em contato em breve.",
    });
  };

  const handleStatusChange = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date() }
        : ticket
    ));

    toast({
      title: "Status atualizado",
      description: "O status do ticket foi atualizado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets de Suporte</CardTitle>
              <CardDescription>Histórico de atendimento e suporte técnico</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Ticket</DialogTitle>
                  <DialogDescription>
                    Descreva seu problema ou solicitação para nossa equipe de suporte.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                      placeholder="Descreva brevemente o problema"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select 
                        value={newTicket.priority} 
                        onValueChange={(value: any) => setNewTicket({...newTicket, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={newTicket.category} 
                        onValueChange={(value: any) => setNewTicket({...newTicket, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Técnico</SelectItem>
                          <SelectItem value="billing">Faturamento</SelectItem>
                          <SelectItem value="feature">Funcionalidade</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      placeholder="Descreva detalhadamente o problema ou solicitação"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTicket}>
                      Criar Ticket
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Nenhum ticket de suporte registrado</p>
              <p className="text-sm">Clique em "Novo Ticket" para criar sua primeira solicitação</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status === 'open' && 'Aberto'}
                          {ticket.status === 'in_progress' && 'Em Andamento'}
                          {ticket.status === 'resolved' && 'Resolvido'}
                          {ticket.status === 'closed' && 'Fechado'}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority === 'low' && 'Baixa'}
                          {ticket.priority === 'medium' && 'Média'}
                          {ticket.priority === 'high' && 'Alta'}
                          {ticket.priority === 'urgent' && 'Urgente'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Criado em {ticket.createdAt.toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{ticket.responses.length} respostas</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {ticket.status === 'open' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                        >
                          Iniciar
                        </Button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusChange(ticket.id, 'resolved')}
                        >
                          Resolver
                        </Button>
                      )}
                      {ticket.status === 'resolved' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(ticket.id, 'closed')}
                        >
                          Fechar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {ticket.responses.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Últimas Respostas:</h4>
                      <div className="space-y-2">
                        {ticket.responses.slice(-2).map((response) => (
                          <div key={response.id} className={`text-sm p-3 rounded ${
                            response.isFromSupport 
                              ? 'bg-blue-50 border-l-4 border-blue-400' 
                              : 'bg-gray-50 border-l-4 border-gray-400'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs">
                                {response.isFromSupport ? '🛠️ ' : '👤 '}{response.author}
                              </span>
                              <span className="text-xs text-gray-500">
                                {response.createdAt.toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p>{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
