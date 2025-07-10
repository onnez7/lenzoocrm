import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageCircle, Clock, CheckCircle, AlertCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supportService, SupportTicket, TicketMessage } from "@/services/supportService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SupportTickets() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "medium", category: "technical" });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!token) return;
    supportService.getMyTickets(token).then(setTickets);
  }, [token]);

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      toast({ title: "Erro", description: "Título e descrição são obrigatórios", variant: "destructive" });
      return;
    }
    try {
      const ticket = await supportService.createTicket(newTicket, token!);
      setTickets([ticket, ...tickets]);
      setNewTicket({ title: "", description: "", priority: "medium", category: "technical" });
      setIsDialogOpen(false);
      toast({ title: "Ticket criado", description: "Seu ticket foi criado com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Erro ao criar ticket", variant: "destructive" });
    }
  };

  const openTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setLoadingMessages(true);
    try {
      const msgs = await supportService.getTicketMessages(ticket.id, token!);
      setMessages(msgs);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    try {
      await supportService.addTicketMessage(selectedTicket.id, newMessage, token!);
      const msgs = await supportService.getTicketMessages(selectedTicket.id, token!);
      setMessages(msgs);
      setNewMessage("");
    } catch {
      toast({ title: "Erro", description: "Erro ao enviar mensagem", variant: "destructive" });
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tickets de Suporte</h2>
          <p className="text-gray-600">Gerencie suas solicitações de suporte</p>
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
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Descreva brevemente o problema"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
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
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
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
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Descreva detalhadamente o problema ou solicitação"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTicket}>Criar Ticket</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum ticket encontrado</p>
              <p className="text-sm text-gray-400">Clique em \"Novo Ticket\" para criar sua primeira solicitação</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openTicket(ticket)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                      <span className="text-xs text-gray-500">{ticket.status}</span>
                      <span className="text-xs text-gray-500">{ticket.priority}</span>
                      <span className="text-xs text-gray-500">{ticket.category}</span>
                    </div>
                    <CardDescription>{ticket.description}</CardDescription>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>Criado em {new Date(ticket.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Modal de mensagens do ticket */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ticket: {selectedTicket.title}</DialogTitle>
              <DialogDescription>
                Status: {selectedTicket.status} | Prioridade: {selectedTicket.priority} | Categoria: {selectedTicket.category}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loadingMessages ? (
                <p>Carregando mensagens...</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="border-b pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{msg.author_name}</span>
                      <span className="text-xs text-gray-500">{msg.author_role}</span>
                      <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString("pt-BR")}</span>
                    </div>
                    <p>{msg.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={2}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                Enviar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}