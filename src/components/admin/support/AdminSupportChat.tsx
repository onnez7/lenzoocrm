
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  MessageCircle, 
  User, 
  Users, 
  Search,
  Phone,
  Video,
  MoreVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isFromAdmin: boolean;
}

interface ActiveChat {
  id: string;
  franchisee: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status: 'online' | 'away' | 'offline';
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isActive: boolean;
}

export function AdminSupportChat() {
  const { toast } = useToast();
  
  const [activeChats] = useState<ActiveChat[]>([
    {
      id: '1',
      franchisee: {
        id: '1',
        name: 'João Silva',
        email: 'joao@franquia1.com',
        status: 'online'
      },
      lastMessage: 'Preciso de ajuda com o relatório de vendas',
      lastMessageTime: new Date(Date.now() - 300000),
      unreadCount: 2,
      isActive: true
    },
    {
      id: '2',
      franchisee: {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@franquia2.com',
        status: 'away'
      },
      lastMessage: 'Obrigada pela ajuda!',
      lastMessageTime: new Date(Date.now() - 900000),
      unreadCount: 0,
      isActive: false
    },
    {
      id: '3',
      franchisee: {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@franquia3.com',
        status: 'online'
      },
      lastMessage: 'O sistema está apresentando erro...',
      lastMessageTime: new Date(Date.now() - 1800000),
      unreadCount: 1,
      isActive: false
    }
  ]);

  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Olá! Preciso de ajuda com o relatório de vendas. Não consigo exportar os dados.',
      senderId: '1',
      senderName: 'João Silva',
      timestamp: new Date(Date.now() - 600000),
      isFromAdmin: false
    },
    {
      id: '2',
      message: 'Olá João! Posso ajudá-lo com isso. Qual o período que você está tentando exportar?',
      senderId: 'admin',
      senderName: 'Suporte',
      timestamp: new Date(Date.now() - 300000),
      isFromAdmin: true
    },
    {
      id: '3',
      message: 'Estou tentando exportar os dados do mês passado.',
      senderId: '1',
      senderName: 'João Silva',
      timestamp: new Date(Date.now() - 60000),
      isFromAdmin: false
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
  }, [messages, selectedChat]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      senderId: 'admin',
      senderName: 'Suporte',
      timestamp: new Date(),
      isFromAdmin: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada ao franqueado!",
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Ausente';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  const filteredChats = activeChats.filter(chat =>
    chat.franchisee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentChat = activeChats.find(chat => chat.id === selectedChat);
  const chatMessages = messages.filter(msg => 
    msg.senderId === currentChat?.franchisee.id || msg.senderId === 'admin'
  );

  return (
    <div className="flex h-[700px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-3">Conversas Ativas</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-120px)]">
          <div className="p-2 space-y-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat === chat.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.franchisee.avatar} />
                      <AvatarFallback>
                        {chat.franchisee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(chat.franchisee.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{chat.franchisee.name}</p>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessageTime.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{chat.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(chat.franchisee.status)}
                      </Badge>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentChat.franchisee.avatar} />
                      <AvatarFallback>
                        {currentChat.franchisee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(currentChat.franchisee.status)}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentChat.franchisee.name}</h3>
                    <p className="text-sm text-gray-500">{currentChat.franchisee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[70%] ${
                      message.isFromAdmin ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isFromAdmin 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {message.isFromAdmin ? '🛠️' : <User className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.isFromAdmin
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border shadow-sm'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <div className={`text-xs mt-1 ${
                          message.isFromAdmin ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Pressione Enter para enviar
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
