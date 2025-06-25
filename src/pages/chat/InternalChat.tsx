
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IconMessageCircle } from "@tabler/icons-react";


interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  channelId: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
}

interface User {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  avatar?: string;
}

export default function InternalChat() {
  const { toast } = useToast();
  const [channels] = useState<Channel[]>([
    { id: '1', name: 'Geral', description: 'Conversas gerais da equipe', memberCount: 12, isPrivate: false },
    { id: '2', name: 'Suporte', description: 'Discussões sobre tickets', memberCount: 5, isPrivate: false },
    { id: '3', name: 'Desenvolvimento', description: 'Updates técnicos', memberCount: 3, isPrivate: true },
  ]);
  
  const [users] = useState<User[]>([
    { id: '1', name: 'Ana Silva', status: 'online' },
    { id: '2', name: 'João Santos', status: 'away' },
    { id: '3', name: 'Maria Oliveira', status: 'online' },
    { id: '4', name: 'Pedro Costa', status: 'offline' },
  ]);

  const [selectedChannel, setSelectedChannel] = useState('1');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Bom dia pessoal! Como estão os tickets hoje?',
      senderId: '1',
      senderName: 'Ana Silva',
      timestamp: new Date(Date.now() - 600000),
      channelId: '1'
    },
    {
      id: '2',
      message: 'Temos 3 tickets novos de alta prioridade para resolver.',
      senderId: '2',
      senderName: 'João Santos',
      timestamp: new Date(Date.now() - 300000),
      channelId: '1'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChannel]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      senderId: 'current-user',
      senderName: 'Você',
      timestamp: new Date(),
      channelId: selectedChannel
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada com sucesso!",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.channelId === selectedChannel &&
    (searchTerm === '' || msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="flex h-[800px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Chat Interno</h2>
          <p className="text-sm text-gray-600">Colaboração da equipe</p>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Canais
              </h3>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedChannel === channel.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {channel.isPrivate ? '🔒' : '#'} {channel.name}
                      <Badge variant="outline" className="ml-auto">
                        {channel.memberCount}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Equipe Online
              </h3>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">{currentChannel?.name}</h3>
            <Badge variant="outline">{currentChannel?.memberCount} membros</Badge>
          </div>
          <p className="text-sm text-gray-600">{currentChannel?.description}</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {message.senderName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.senderName}</span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{message.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Mensagem #${currentChannel?.name.toLowerCase()}`}
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
