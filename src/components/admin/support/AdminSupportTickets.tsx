
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  MessageCircle, 
  User,
  Calendar,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature' | 'bug' | 'other';
  franchisee: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  responses: number;
  assignedTo?: string;
}

interface AdminSupportTicketsProps {
  searchTerm: string;
  onTicketSelect: (ticketId: string) => void;
  selectedTicket: string | null;
}

export function AdminSupportTickets({ 
  searchTerm, 
  onTicketSelect, 
  selectedTicket 
}: AdminSupportTicketsProps) {
  const { toast } = useToast();
  
  const [tickets] = useState<SupportTicket[]>([
    {
      id: '1',
      title: 'Problema na sincronização de estoque',
      description: 'O estoque não está sendo atualizado corretamente após as vendas realizadas no sistema.',
      status: 'open',
      priority: 'high',
      category: 'technical',
      franchisee: {
        id: '1',
        name: 'João Silva',
        email: 'joao@franquia1.com',
      },
      createdAt: new Date('2024-06-20'),
      updatedAt: new Date('2024-06-21'),
      responses: 2,
      assignedTo: 'Ana Suporte'
    },
    {
      id: '2',
      title: 'Dúvida sobre cobrança mensal',
      description: 'Não estou entendendo os valores cobrados este mês.',
      status: 'in_progress',
      priority: 'medium',
      category: 'billing',
      franchisee: {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@franquia2.com',
      },
      createdAt: new Date('2024-06-19'),
      updatedAt: new Date('2024-06-20'),
      responses: 1
    },
    {
      id: '3',
      title: 'Solicitar nova funcionalidade',
      description: 'Gostaria de solicitar um relatório personalizado para vendas.',
      status: 'open',
      priority: 'low',
      category: 'feature',
      franchisee: {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@franquia3.com',
      },
      createdAt: new Date('2024-06-18'),
      updatedAt: new Date('2024-06-18'),
      responses: 0
    }
  ]);

  const [selectedTicketData, setSelectedTicketData] = useState<SupportTicket | null>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

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
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicketData(ticket);
    setNewStatus(ticket.status);
    onTicketSelect(ticket.id);
  };

  const handleSendResponse = () => {
    if (!response.trim()) return;

    toast({
      title: "Resposta enviada",
      description: "Sua resposta foi enviada ao franqueado com sucesso!",
    });

    setResponse('');
    setSelectedTicketData(null);
  };

  const handleStatusChange = () => {
    if (!newStatus || !selectedTicketData) return;

    toast({
      title: "Status atualizado",
      description: `Ticket alterado para: ${getStatusLabel(newStatus)}`,
    });

    setSelectedTicketData(null);
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.franchisee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum ticket encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedTicket === ticket.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleTicketClick(ticket)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(ticket.status)}
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </div>
                    <CardDescription className="mb-3">{ticket.description}</CardDescription>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={ticket.franchisee.avatar} />
                          <AvatarFallback>
                            {ticket.franchisee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{ticket.franchisee.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {ticket.createdAt.toLocaleDateString('pt-BR')}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MessageCircle className="h-3 w-3" />
                        {ticket.responses} respostas
                      </div>
                      
                      {ticket.assignedTo && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          {ticket.assignedTo}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicketData} onOpenChange={() => setSelectedTicketData(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTicketData && getStatusIcon(selectedTicketData.status)}
              {selectedTicketData?.title}
            </DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicketData?.id} - {selectedTicketData?.franchisee.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicketData && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={getStatusColor(selectedTicketData.status)}>
                  {getStatusLabel(selectedTicketData.status)}
                </Badge>
                <Badge className={getPriorityColor(selectedTicketData.priority)}>
                  {getPriorityLabel(selectedTicketData.priority)}
                </Badge>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Descrição do Problema:</h4>
                <p className="text-sm text-gray-700">{selectedTicketData.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Alterar Status:</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Resposta:</label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Digite sua resposta para o franqueado..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTicketData(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleStatusChange} variant="outline">
                  Atualizar Status
                </Button>
                <Button onClick={handleSendResponse}>
                  Enviar Resposta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
