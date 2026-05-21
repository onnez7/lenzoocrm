import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supportService, SupportTicket, TicketMessage } from "@/services/supportService";

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];
const categoryOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'technical', label: 'Técnico' },
  { value: 'billing', label: 'Faturamento' },
  { value: 'feature', label: 'Funcionalidade' },
  { value: 'bug', label: 'Bug' },
  { value: 'other', label: 'Outro' },
];

export default function AdminSupport() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!token) return;
    supportService.getAllTickets(token).then(setTickets);
  }, [token]);

  const filteredTickets = tickets.filter(
    (ticket) =>
      (statusFilter === 'all' || ticket.status === statusFilter) &&
      (categoryFilter === 'all' || ticket.category === categoryFilter) &&
      (ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.franchise_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tickets de Suporte (Admin)</h2>
          <p className="text-gray-600">Visualize e responda tickets de todas as franquias</p>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Buscar por título, descrição ou franquia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhum ticket encontrado</p>
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
                      <span className="text-xs text-gray-500">{ticket.franchise_name}</span>
                    </div>
                    <CardDescription>{ticket.description}</CardDescription>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>Criado em {new Date(ticket.created_at).toLocaleDateString("pt-BR")}</span>
                      <span>Por: {ticket.opened_by}</span>
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
                Status: {selectedTicket.status} | Prioridade: {selectedTicket.priority} | Categoria: {selectedTicket.category} | Franquia: {selectedTicket.franchise_name}
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