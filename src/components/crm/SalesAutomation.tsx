
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
  Zap,
  Mail,
  Phone,
  Calendar,
  Target,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Plus
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'paused' | 'draft';
  executions: number;
  successRate: number;
  lastRun: Date;
  category: 'lead_nurturing' | 'follow_up' | 'qualification' | 'retention';
}

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'phone' | 'multi_channel';
  status: 'active' | 'completed' | 'paused';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  startDate: Date;
  endDate?: Date;
}

const mockAutomationRules: AutomationRule[] = [
  {
    id: "1",
    name: "Boas-vindas Novos Leads",
    trigger: "Novo lead cadastrado",
    actions: ["Enviar email de boas-vindas", "Agendar ligação em 24h", "Adicionar à sequência de nurturing"],
    status: "active",
    executions: 245,
    successRate: 87,
    lastRun: new Date("2024-01-10"),
    category: "lead_nurturing"
  },
  {
    id: "2",
    name: "Follow-up Proposta Enviada",
    trigger: "Proposta enviada há 3 dias sem resposta",
    actions: ["Enviar email de follow-up", "Notificar vendedor", "Agendar nova atividade"],
    status: "active",
    executions: 89,
    successRate: 72,
    lastRun: new Date("2024-01-09"),
    category: "follow_up"
  },
  {
    id: "3",
    name: "Qualificação Automática",
    trigger: "Lead visita página de preços 3x",
    actions: ["Marcar como qualificado", "Notificar vendedor", "Agendar demonstração"],
    status: "active",
    executions: 156,
    successRate: 94,
    lastRun: new Date("2024-01-10"),
    category: "qualification"
  },
  {
    id: "4",
    name: "Reativação Clientes Inativos",
    trigger: "Cliente inativo há 90 dias",
    actions: ["Enviar pesquisa de satisfação", "Oferecer desconto especial", "Agendar reunião"],
    status: "paused",
    executions: 67,
    successRate: 45,
    lastRun: new Date("2024-01-05"),
    category: "retention"
  }
];

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Campanha Black Friday 2024",
    type: "multi_channel",
    status: "active",
    sent: 2450,
    delivered: 2380,
    opened: 1456,
    clicked: 289,
    converted: 67,
    startDate: new Date("2024-01-01")
  },
  {
    id: "2",
    name: "Webinar Produto Novo",
    type: "email",
    status: "completed",
    sent: 1200,
    delivered: 1180,
    opened: 854,
    clicked: 234,
    converted: 45,
    startDate: new Date("2023-12-15"),
    endDate: new Date("2023-12-20")
  }
];

export function SalesAutomation() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(mockAutomationRules);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paused': return 'Pausado';
      case 'draft': return 'Rascunho';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'lead_nurturing': return 'Nutrição de Leads';
      case 'follow_up': return 'Follow-up';
      case 'qualification': return 'Qualificação';
      case 'retention': return 'Retenção';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lead_nurturing': return Users;
      case 'follow_up': return Phone;
      case 'qualification': return Target;
      case 'retention': return BarChart3;
      default: return Zap;
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setAutomationRules(rules => 
      rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
          : rule
      )
    );
  };

  const totalExecutions = automationRules.reduce((sum, rule) => sum + rule.executions, 0);
  const averageSuccessRate = automationRules.reduce((sum, rule) => sum + rule.successRate, 0) / automationRules.length;
  const activeRules = automationRules.filter(rule => rule.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Métricas de Automação */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeRules}</div>
            <p className="text-xs text-muted-foreground">
              de {automationRules.length} regras totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              execuções no último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{averageSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              média das automações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia de Tempo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">245h</div>
            <p className="text-xs text-muted-foreground">
              economizadas este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Regras de Automação</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Regras de Automação</CardTitle>
                  <CardDescription>
                    Configure e gerencie suas automações de vendas
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Regra
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => {
                  const CategoryIcon = getCategoryIcon(rule.category);
                  return (
                    <Card key={rule.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                            <CategoryIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground">{rule.trigger}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(rule.status)}>
                            {getStatusLabel(rule.status)}
                          </Badge>
                          <Switch
                            checked={rule.status === 'active'}
                            onCheckedChange={() => toggleRuleStatus(rule.id)}
                          />
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Categoria</p>
                          <p className="text-sm text-muted-foreground">
                            {getCategoryLabel(rule.category)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Execuções</p>
                          <p className="text-sm text-muted-foreground">
                            {rule.executions.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Taxa de Sucesso</p>
                          <div className="flex items-center gap-2">
                            <Progress value={rule.successRate} className="w-16 h-2" />
                            <span className="text-sm font-medium">{rule.successRate}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Última Execução</p>
                          <p className="text-sm text-muted-foreground">
                            {rule.lastRun.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Ações Configuradas:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.actions.map((action, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campanhas de Marketing</CardTitle>
                  <CardDescription>
                    Gerencie suas campanhas de marketing direto
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviados</TableHead>
                    <TableHead>Taxa de Abertura</TableHead>
                    <TableHead>Taxa de Clique</TableHead>
                    <TableHead>Conversões</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.startDate.toLocaleDateString('pt-BR')}
                            {campaign.endDate && ` - ${campaign.endDate.toLocaleDateString('pt-BR')}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {campaign.type === 'multi_channel' ? 'Multi-canal' : 
                           campaign.type === 'email' ? 'E-mail' :
                           campaign.type === 'sms' ? 'SMS' : 'Telefone'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.sent.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{((campaign.opened / campaign.delivered) * 100).toFixed(1)}%</span>
                          <Progress 
                            value={(campaign.opened / campaign.delivered) * 100} 
                            className="w-16 h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{((campaign.clicked / campaign.opened) * 100).toFixed(1)}%</span>
                          <Progress 
                            value={(campaign.clicked / campaign.opened) * 100} 
                            className="w-16 h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{campaign.converted}</div>
                        <div className="text-sm text-muted-foreground">
                          {((campaign.converted / campaign.sent) * 100).toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-green-600 font-medium">+245%</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance das Automações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Nutrição de Leads</span>
                    <div className="flex items-center gap-2">
                      <Progress value={87} className="w-24 h-2" />
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Follow-up</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-24 h-2" />
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Qualificação</span>
                    <div className="flex items-center gap-2">
                      <Progress value={94} className="w-24 h-2" />
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retenção</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-24 h-2" />
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impacto da Automação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Leads Qualificados</h3>
                    <p className="text-2xl font-bold text-green-600">+156%</p>
                    <p className="text-sm text-muted-foreground">vs período anterior</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Tempo de Resposta</h3>
                    <p className="text-2xl font-bold text-blue-600">-78%</p>
                    <p className="text-sm text-muted-foreground">tempo médio reduzido</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Produtividade da Equipe</h3>
                    <p className="text-2xl font-bold text-purple-600">+89%</p>
                    <p className="text-sm text-muted-foreground">tarefas automatizadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
