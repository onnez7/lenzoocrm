
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign,
  Calendar,
  User,
  Building,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Filter,
  Search,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  contact: string;
  value: number;
  probability: number;
  stage: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
  assignedTo: string;
  expectedCloseDate: Date;
  lastActivity: Date;
  daysInStage: number;
  activities: number;
}

const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    title: "Implementação Sistema ERP",
    company: "TechCorp LTDA",
    contact: "João Silva",
    value: 125000,
    probability: 75,
    stage: "Negociação",
    priority: "high",
    source: "Website",
    assignedTo: "Maria Santos",
    expectedCloseDate: new Date("2024-02-15"),
    lastActivity: new Date("2024-01-10"),
    daysInStage: 12,
    activities: 8
  },
  {
    id: "2",
    title: "Consultoria Digital",
    company: "StartupXYZ",
    contact: "Ana Costa",
    value: 45000,
    probability: 60,
    stage: "Proposta",
    priority: "medium",
    source: "Indicação",
    assignedTo: "Carlos Oliveira",
    expectedCloseDate: new Date("2024-02-28"),
    lastActivity: new Date("2024-01-08"),
    daysInStage: 8,
    activities: 5
  },
  {
    id: "3",
    title: "Licenciamento Software",
    company: "MegaCorp SA",
    contact: "Pedro Oliveira",
    value: 89000,
    probability: 40,
    stage: "Qualificação",
    priority: "high",
    source: "LinkedIn",
    assignedTo: "Ana Costa",
    expectedCloseDate: new Date("2024-03-10"),
    lastActivity: new Date("2024-01-05"),
    daysInStage: 18,
    activities: 3
  }
];

export function OpportunityManagement() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "all" || opp.stage === stageFilter;
    const matchesPriority = priorityFilter === "all" || opp.priority === priorityFilter;
    return matchesSearch && matchesStage && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Prospecção': return 'bg-blue-100 text-blue-800';
      case 'Qualificação': return 'bg-purple-100 text-purple-800';
      case 'Proposta': return 'bg-orange-100 text-orange-800';
      case 'Negociação': return 'bg-yellow-100 text-yellow-800';
      case 'Fechamento': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysInStageStatus = (days: number) => {
    if (days > 21) return { color: 'text-red-600', icon: AlertCircle };
    if (days > 14) return { color: 'text-yellow-600', icon: Clock };
    return { color: 'text-green-600', icon: CheckCircle };
  };

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
  const averageDeal = totalValue / opportunities.length;

  return (
    <div className="space-y-6">
      {/* Resumo do Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              oportunidades ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              em oportunidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Ponderado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {(weightedValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              probabilidade aplicada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(averageDeal / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              por oportunidade
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Oportunidades</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Visual</TabsTrigger>
          <TabsTrigger value="forecast">Previsão</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Oportunidades</CardTitle>
              <CardDescription>
                Acompanhe e gerencie todas as oportunidades de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar oportunidades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por estágio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estágios</SelectItem>
                    <SelectItem value="Prospecção">Prospecção</SelectItem>
                    <SelectItem value="Qualificação">Qualificação</SelectItem>
                    <SelectItem value="Proposta">Proposta</SelectItem>
                    <SelectItem value="Negociação">Negociação</SelectItem>
                    <SelectItem value="Fechamento">Fechamento</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Oportunidade
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oportunidade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estágio</TableHead>
                    <TableHead>Probabilidade</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Tempo no Estágio</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.map((opportunity) => {
                    const stageStatus = getDaysInStageStatus(opportunity.daysInStage);
                    const StatusIcon = stageStatus.icon;
                    
                    return (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{opportunity.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {opportunity.company} • {opportunity.contact}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            R$ {opportunity.value.toLocaleString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStageColor(opportunity.stage)}>
                            {opportunity.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={opportunity.probability} className="w-16 h-2" />
                            <span className="text-sm font-medium">{opportunity.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(opportunity.priority)}>
                            {getPriorityLabel(opportunity.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm">{opportunity.assignedTo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${stageStatus.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{opportunity.daysInStage} dias</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                              <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Agendar Atividade</DropdownMenuItem>
                              <DropdownMenuItem>Mover Estágio</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Visual</CardTitle>
              <CardDescription>
                Visualização em Kanban do pipeline de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pipeline visual será implementado em breve...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Vendas</CardTitle>
              <CardDescription>
                Análise preditiva baseada no pipeline atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Este Mês</h3>
                  <p className="text-2xl font-bold text-green-600">R$ 89K</p>
                  <p className="text-sm text-muted-foreground">78% de confiança</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Próximo Mês</h3>
                  <p className="text-2xl font-bold text-blue-600">R$ 156K</p>
                  <p className="text-sm text-muted-foreground">65% de confiança</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Trimestre</h3>
                  <p className="text-2xl font-bold text-purple-600">R$ 425K</p>
                  <p className="text-sm text-muted-foreground">58% de confiança</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
