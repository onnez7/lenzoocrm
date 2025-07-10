import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle, User, Plus, Trash2, Users, Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { franchiseChatService, FranchiseChannel, FranchiseChannelMessage, FranchiseMember } from "@/services/franchiseChatService";

export default function FranchiseChat() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<FranchiseChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<FranchiseChannel | null>(null);
  const [messages, setMessages] = useState<FranchiseChannelMessage[]>([]);
  const [members, setMembers] = useState<FranchiseMember[]>([]);
  const [channelMembers, setChannelMembers] = useState<FranchiseMember[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelMembers, setNewChannelMembers] = useState<number[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessages, setLastMessages] = useState<{[channelId: number]: number}>({});
  const [lastChannels, setLastChannels] = useState<number[]>([]);

  // Buscar canais e membros reais da franquia
  useEffect(() => {
    if (!token || !user) return;
    async function load() {
      const chans = await franchiseChatService.getMyChannels(token);
      setChannels(chans);
      if (chans.length > 0 && !selectedChannel) setSelectedChannel(chans[0]);
      const membs = await franchiseChatService.getFranchiseMembers(user.franchiseId!, token);
      setMembers(membs);
    }
    load();
    // eslint-disable-next-line
  }, [token, user]);

  // Buscar mensagens e membros do canal selecionado
  useEffect(() => {
    if (!token || !selectedChannel) return;
    async function loadMsgs() {
      const msgs = await franchiseChatService.getChannelMessages(selectedChannel.id, token);
      setMessages(msgs);
      // Buscar membros do canal
      const membs = await franchiseChatService.getFranchiseMembers(selectedChannel.franchise_id, token);
      // Filtrar só os que participam do canal
      const channelMembIds = new Set(msgs.map(m => m.user_id));
      setChannelMembers(membs.filter(m => channelMembIds.has(m.id)));
    }
    loadMsgs();
    // eslint-disable-next-line
  }, [token, selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling para novas mensagens/canais
  useEffect(() => {
    if (!token || !user) return;
    const interval = setInterval(async () => {
      // Buscar canais
      const chans = await franchiseChatService.getMyChannels(token);
      // Notificar novo canal
      if (lastChannels.length > 0) {
        const newChans = chans.filter(c => !lastChannels.includes(c.id));
        if (newChans.length > 0) {
          newChans.forEach(c => {
            toast({
              title: "Novo canal",
              description: `Você foi adicionado ao canal '${c.name}'`,
              variant: "default"
            });
          });
        }
      }
      setChannels(chans);
      setLastChannels(chans.map(c => c.id));

      // Buscar mensagens dos canais (exceto o aberto)
      for (const c of chans) {
        if (!selectedChannel || c.id !== selectedChannel.id) {
          const msgs = await franchiseChatService.getChannelMessages(c.id, token);
          const lastCount = lastMessages[c.id] || 0;
          if (msgs.length > lastCount) {
            toast({
              title: `Nova mensagem em ${c.name}`,
              description: `${msgs[msgs.length-1].author_name}: ${msgs[msgs.length-1].message}`,
              variant: "default"
            });
          }
          setLastMessages(prev => ({ ...prev, [c.id]: msgs.length }));
        }
      }
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [token, user, selectedChannel, lastChannels, lastMessages]);

  const handleSendMessage = async () => {
    if (!selectedChannel || !newMessage.trim() || !token) return;
    try {
      await franchiseChatService.sendMessage(selectedChannel.id, newMessage, token);
      const msgs = await franchiseChatService.getChannelMessages(selectedChannel.id, token);
      setMessages(msgs);
      setNewMessage("");
    } catch {
      toast({ title: "Erro", description: "Erro ao enviar mensagem", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || newChannelMembers.length === 0 || !token) {
      toast({ title: "Erro", description: "Nome e membros obrigatórios", variant: "destructive" });
      return;
    }
    try {
      await franchiseChatService.createChannel({
        name: newChannelName,
        is_private: isPrivate,
        memberIds: newChannelMembers
      }, token);
      setIsCreateDialogOpen(false);
      setNewChannelName("");
      setNewChannelMembers([]);
      setIsPrivate(false);
      const chans = await franchiseChatService.getMyChannels(token);
      setChannels(chans);
      toast({ title: "Canal criado", description: "Canal criado com sucesso!" });
    } catch {
      toast({ title: "Erro", description: "Erro ao criar canal", variant: "destructive" });
    }
  };

  const handleDeleteChannel = async (id: number) => {
    if (!token) return;
    try {
      await franchiseChatService.deleteChannel(id, token);
      setChannels(channels.filter(c => c.id !== id));
      setSelectedChannel(channels.length > 1 ? channels[0] : null);
      toast({ title: "Canal deletado" });
    } catch {
      toast({ title: "Erro", description: "Erro ao deletar canal", variant: "destructive" });
    }
  };

  const handleAddMembers = async (ids: number[]) => {
    if (!selectedChannel || !token) return;
    try {
      await franchiseChatService.addMembers(selectedChannel.id, ids, token);
      toast({ title: "Membros adicionados" });
    } catch {
      toast({ title: "Erro", description: "Erro ao adicionar membros", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedChannel || !token) return;
    try {
      await franchiseChatService.removeMember(selectedChannel.id, userId, token);
      toast({ title: "Membro removido" });
    } catch {
      toast({ title: "Erro", description: "Erro ao remover membro", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-[700px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Canais</h2>
            <p className="text-sm text-gray-600">Chat da franquia</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Canal</DialogTitle>
                <DialogDescription>Escolha o nome e os membros do canal</DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Nome do canal"
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                className="mb-2"
              />
              <div className="flex items-center gap-2 mb-2">
                <Checkbox checked={isPrivate} onCheckedChange={v => setIsPrivate(!!v)} id="private" />
                <label htmlFor="private" className="text-sm">Privado</label>
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium mb-1">Membros</p>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {members.map(m => (
                    <label key={`member-${selectedChannel?.id}-${m.id}`} className="flex items-center gap-2 mb-1 cursor-pointer">
                      <Checkbox
                        checked={newChannelMembers.includes(m.id)}
                        onCheckedChange={v => {
                          if (v) setNewChannelMembers(arr => [...arr, m.id]);
                          else setNewChannelMembers(arr => arr.filter(id => id !== m.id));
                        }}
                      />
                      <span>{m.name} <span className="text-xs text-gray-500">({m.role})</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateChannel}>Criar Canal</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 overflow-y-auto">
          {channels.map((c) => (
            <div
              key={c.id}
              className={`p-3 border-b cursor-pointer flex items-center gap-2 ${selectedChannel?.id === c.id ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100"}`}
              onClick={() => setSelectedChannel(c)}
            >
              <Users className="h-4 w-4" />
              <span className="font-medium">{c.name}</span>
              {c.is_private && <Badge variant="secondary">Privado</Badge>}
              {user && c.created_by === user.id && (
                <Button size="icon" variant="ghost" className="ml-auto" onClick={e => { e.stopPropagation(); handleDeleteChannel(c.id); }}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">{selectedChannel?.name}</h3>
            {selectedChannel?.is_private && <Badge variant="secondary">Privado</Badge>}
          </div>
          {/* Lista de membros do canal */}
          <div className="flex items-center gap-2">
            {channelMembers.map(m => (
              <div key={`member-${selectedChannel?.id}-${m.id}`} className="flex items-center gap-1">
                <span className="text-xs font-medium">{m.name}</span>
                {user && selectedChannel && selectedChannel.created_by === user.id && m.id !== user.id && (
                  <Button size="icon" variant="ghost" onClick={() => handleRemoveMember(m.id)}>
                    <X className="h-3 w-3 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            {/* Adicionar membros (apenas criador) */}
            {user && selectedChannel && selectedChannel.created_by === user.id && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" aria-describedby="add-members-desc">
                  <DialogHeader>
                    <DialogTitle>Adicionar Membros</DialogTitle>
                    <DialogDescription id="add-members-desc">Selecione membros para adicionar ao canal</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 mb-2">
                    {members.filter(m => !channelMembers.some(cm => cm.id === m.id)).map(m => (
                      <label key={`add-member-${selectedChannel?.id}-${m.id}`} className="flex items-center gap-2 mb-1 cursor-pointer">
                        <Checkbox
                          checked={false}
                          onCheckedChange={v => v && handleAddMembers([m.id])}
                        />
                        <span>{m.name} <span className="text-xs text-gray-500">({m.role})</span></span>
                      </label>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                Nenhuma mensagem ainda. Seja o primeiro a conversar!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {msg.author_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.author_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Mensagem #${selectedChannel?.name?.toLowerCase() || "geral"}`}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pressione Enter para enviar, Shift + Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}