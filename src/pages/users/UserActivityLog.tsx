
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Activity, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityLog {
  id: string;
  user: string;
  action: 'create' | 'edit' | 'delete';
  resource: string;
  description: string;
  timestamp: Date;
  ip?: string;
}

const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    user: "Ana Oliveira",
    action: "create",
    resource: "Cliente",
    description: "Criou novo cliente: João Silva",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    ip: "192.168.1.10"
  },
  {
    id: "2",
    user: "Carlos Santos",
    action: "edit",
    resource: "Produto",
    description: "Editou produto: Óculos Ray-Ban RB3025",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    ip: "192.168.1.15"
  },
  {
    id: "3",
    user: "Maria Costa",
    action: "delete",
    resource: "Ordem de Serviço",
    description: "Excluiu ordem de serviço #OS-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    ip: "192.168.1.20"
  },
  {
    id: "4",
    user: "Ana Oliveira",
    action: "create",
    resource: "Venda",
    description: "Registrou nova venda no valor de R$ 450,00",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    ip: "192.168.1.10"
  },
  {
    id: "5",
    user: "Carlos Santos",
    action: "edit",
    resource: "Cliente",
    description: "Atualizou dados do cliente: Maria Fernandes",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    ip: "192.168.1.15"
  },
  {
    id: "6",
    user: "Maria Costa",
    action: "create",
    resource: "Agendamento",
    description: "Criou novo agendamento para 25/01/2024",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    ip: "192.168.1.20"
  }
];

const UserActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const uniqueUsers = Array.from(new Set(logs.map(log => log.user)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = userFilter === "all" || log.user === userFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    // Filtrar apenas últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const isWithinLast30Days = log.timestamp >= thirtyDaysAgo;
    
    return matchesSearch && matchesUser && matchesAction && isWithinLast30Days;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'Criou';
      case 'edit': return 'Editou';
      case 'delete': return 'Excluiu';
      default: return action;
    }
  };

  const totalActions = filteredLogs.length;
  const createActions = filteredLogs.filter(log => log.action === 'create').length;
  const editActions = filteredLogs.filter(log => log.action === 'edit').length;
  const deleteActions = filteredLogs.filter(log => log.action === 'delete').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Log de Atividades</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as ações dos usuários nos últimos 30 dias
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Últimos 30 dias</span>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalActions}
            </div>
            <p className="text-xs text-muted-foreground">
              Nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criações</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {createActions}
            </div>
            <p className="text-xs text-muted-foreground">
              Novos registros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edições</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {editActions}
            </div>
            <p className="text-xs text-muted-foreground">
              Alterações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exclusões</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {deleteActions}
            </div>
            <p className="text-xs text-muted-foreground">
              Registros removidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
          <CardDescription>
            Todas as ações realizadas pelos usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou recurso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-48">
                <User className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="create">Criações</SelectItem>
                <SelectItem value="edit">Edições</SelectItem>
                <SelectItem value="delete">Exclusões</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{log.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(log.timestamp, "dd/MM/yyyy", { locale: ptBR })}</div>
                      <div className="text-muted-foreground">
                        {format(log.timestamp, "HH:mm:ss", { locale: ptBR })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.ip}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma atividade encontrada com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivityLog;
