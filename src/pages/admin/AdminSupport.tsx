
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Ticket, HeadphonesIcon, Search, Filter, Plus } from "lucide-react";
import { AdminSupportTickets } from "@/components/admin/support/AdminSupportTickets";
import { AdminSupportChat } from "@/components/admin/support/AdminSupportChat";
import { AdminSupportStats } from "@/components/admin/support/AdminSupportStats";

export default function AdminSupport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tickets');

  const supportStats = {
    totalTickets: 47,
    openTickets: 12,
    inProgress: 8,
    resolved: 27,
    avgResponseTime: '2.4h',
    satisfaction: 4.7
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Suporte</h1>
          <p className="text-gray-600 mt-1">Gerencie tickets e converse com franqueados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Ticket
          </Button>
        </div>
      </div>

      {/* Support Stats */}
      <AdminSupportStats stats={supportStats} />

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar tickets, franqueados ou problemas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Tickets
            <Badge variant="secondary" className="ml-2">
              {supportStats.openTickets}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat ao Vivo
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <HeadphonesIcon className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <AdminSupportTickets 
            searchTerm={searchTerm}
            onTicketSelect={setSelectedTicket}
            selectedTicket={selectedTicket}
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <AdminSupportChat />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises de Suporte</CardTitle>
              <CardDescription>Métricas detalhadas e relatórios de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <HeadphonesIcon className="mx-auto h-12 w-12 mb-4" />
                <p>Dashboards de análises em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
