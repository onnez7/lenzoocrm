
import { AutomationFlow } from "@/components/automation/AutomationFlow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Clock, CheckCircle, PlayCircle } from "lucide-react";

const AutomationPage = () => {
  const activeAutomations = [
    {
      id: "1",
      name: "Boas-vindas para Novos Clientes",
      status: "active",
      lastRun: "2024-01-10 14:30",
      triggers: 23,
      description: "Envia e-mail de boas-vindas e agenda primeira consulta"
    },
    {
      id: "2",
      name: "Follow-up Pós-Compra",
      status: "active",
      lastRun: "2024-01-10 13:15",
      triggers: 12,
      description: "Verifica satisfação e oferece produtos complementares"
    },
    {
      id: "3",
      name: "Lembrete de Retorno",
      status: "paused",
      lastRun: "2024-01-09 16:45",
      triggers: 8,
      description: "Lembra clientes sobre consultas de retorno agendadas"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Automação</h1>
        <p className="text-muted-foreground">
          Configure fluxos automáticos para otimizar seu atendimento
        </p>
      </div>

      <Tabs defaultValue="flows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flows">Fluxos</TabsTrigger>
          <TabsTrigger value="active">Automações Ativas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="flows">
          <AutomationFlow />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automações Ativas
              </CardTitle>
              <CardDescription>
                Gerencie suas automações em execução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAutomations.map((automation) => (
                  <div key={automation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{automation.name}</h4>
                        <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                          {automation.status === 'active' ? 'Ativa' : 'Pausada'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {automation.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="h-3 w-3" />
                          {automation.triggers} execuções
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Última execução: {automation.lastRun}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={automation.status === 'active' ? 'text-red-600' : 'text-green-600'}
                      >
                        {automation.status === 'active' ? 'Pausar' : 'Ativar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Automação</CardTitle>
              <CardDescription>
                Templates prontos para usar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Campanha de Reativação</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Reativa clientes inativos com ofertas especiais
                  </p>
                  <Button size="sm" variant="outline">Usar Template</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Programa de Fidelidade</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Engaja clientes VIP com benefícios exclusivos
                  </p>
                  <Button size="sm" variant="outline">Usar Template</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Pesquisa de Satisfação</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Coleta feedback automático após atendimentos
                  </p>
                  <Button size="sm" variant="outline">Usar Template</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Manutenção Preventiva</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Lembra sobre manutenção e limpeza dos óculos
                  </p>
                  <Button size="sm" variant="outline">Usar Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationPage;
