
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Mail, 
  MessageSquare, 
  Calendar,
  Clock,
  Users,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  executionCount: number;
  lastExecution?: string;
  webhookUrl?: string;
}

const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Lembrete de Consulta",
    description: "Envia lembrete por WhatsApp 1 dia antes da consulta",
    trigger: "agendamento_criado",
    action: "enviar_whatsapp",
    isActive: true,
    executionCount: 45,
    lastExecution: "2024-01-14T10:30:00",
    webhookUrl: ""
  },
  {
    id: "2",
    name: "Follow-up Pós-Venda",
    description: "Envia email de satisfação 7 dias após a compra",
    trigger: "venda_finalizada",
    action: "enviar_email",
    isActive: true,
    executionCount: 23,
    lastExecution: "2024-01-13T15:45:00"
  },
  {
    id: "3",
    name: "Notificação Estoque Baixo",
    description: "Notifica quando produto tem estoque menor que 5 unidades",
    trigger: "estoque_baixo",
    action: "notificacao_interna",
    isActive: false,
    executionCount: 8,
    lastExecution: "2024-01-12T08:20:00"
  }
];

const Automation = () => {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "",
    action: "",
    webhookUrl: ""
  });

  const triggers = [
    { value: "agendamento_criado", label: "Agendamento Criado" },
    { value: "agendamento_confirmado", label: "Agendamento Confirmado" },
    { value: "venda_finalizada", label: "Venda Finalizada" },
    { value: "cliente_cadastrado", label: "Cliente Cadastrado" },
    { value: "estoque_baixo", label: "Estoque Baixo" },
    { value: "produto_sem_estoque", label: "Produto Sem Estoque" }
  ];

  const actions = [
    { value: "enviar_email", label: "Enviar Email", icon: Mail },
    { value: "enviar_whatsapp", label: "Enviar WhatsApp", icon: MessageSquare },
    { value: "notificacao_interna", label: "Notificação Interna", icon: Calendar },
    { value: "webhook", label: "Zapier Webhook", icon: Zap }
  ];

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === id 
        ? { ...automation, isActive: !automation.isActive }
        : automation
    ));

    const automation = automations.find(a => a.id === id);
    toast({
      title: automation?.isActive ? "Automação desativada" : "Automação ativada",
      description: `${automation?.name} foi ${automation?.isActive ? 'desativada' : 'ativada'}.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setAutomations(prev => prev.map(automation => 
        automation.id === editingId 
          ? { 
              ...automation, 
              ...formData,
              webhookUrl: formData.action === 'webhook' ? formData.webhookUrl : undefined
            }
          : automation
      ));
      toast({
        title: "Automação atualizada",
        description: "A automação foi atualizada com sucesso.",
      });
    } else {
      const newAutomation: Automation = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        executionCount: 0,
        webhookUrl: formData.action === 'webhook' ? formData.webhookUrl : undefined
      };
      setAutomations(prev => [...prev, newAutomation]);
      toast({
        title: "Automação criada",
        description: "A nova automação foi criada com sucesso.",
      });
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "", trigger: "", action: "", webhookUrl: "" });
  };

  const startEdit = (automation: Automation) => {
    setFormData({
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger,
      action: automation.action,
      webhookUrl: automation.webhookUrl || ""
    });
    setEditingId(automation.id);
    setShowForm(true);
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(automation => automation.id !== id));
    toast({
      title: "Automação excluída",
      description: "A automação foi removida com sucesso.",
    });
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do webhook Zapier",
        variant: "destructive",
      });
      return;
    }

    setIsTestingWebhook(true);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "Teste de automação do Lenzoo",
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: "Webhook testado",
        description: "O teste foi enviado para o Zapier. Verifique o histórico do seu Zap para confirmar o recebimento.",
      });
    } catch (error) {
      console.error("Erro ao testar webhook:", error);
      toast({
        title: "Erro no teste",
        description: "Falha ao testar o webhook. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const getActionIcon = (action: string) => {
    const actionData = actions.find(a => a.value === action);
    if (actionData) {
      const Icon = actionData.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Settings className="h-4 w-4" />;
  };

  const getActionLabel = (action: string) => {
    return actions.find(a => a.value === action)?.label || action;
  };

  const getTriggerLabel = (trigger: string) => {
    return triggers.find(t => t.value === trigger)?.label || trigger;
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowForm(false)}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {editingId ? "Editar Automação" : "Nova Automação"}
            </h1>
            <p className="text-muted-foreground">
              {editingId ? "Atualize a automação" : "Configure uma nova automação"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Automação</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Lembrete de Consulta"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o que esta automação faz..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger">Gatilho</Label>
                  <Select value={formData.trigger} onValueChange={(value) => setFormData(prev => ({ ...prev, trigger: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quando executar?" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggers.map(trigger => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Ação</Label>
                  <Select value={formData.action} onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="O que fazer?" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          <div className="flex items-center gap-2">
                            <action.icon className="h-4 w-4" />
                            {action.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.action === 'webhook' && (
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <h3 className="font-medium">Configuração Zapier</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">URL do Webhook Zapier</Label>
                    <Input
                      id="webhookUrl"
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      required={formData.action === 'webhook'}
                    />
                    <p className="text-sm text-muted-foreground">
                      Cole aqui a URL do webhook que você criou no Zapier
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? "Atualizar" : "Criar"} Automação
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automação</h1>
          <p className="text-muted-foreground">
            Configure automações para otimizar processos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Automação
        </Button>
      </div>

      {/* Teste de Webhook Zapier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Teste Zapier Webhook
          </CardTitle>
          <CardDescription>
            Teste sua integração com Zapier antes de criar automações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cole aqui a URL do seu webhook Zapier..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <Button onClick={testWebhook} disabled={isTestingWebhook || !webhookUrl}>
              <Zap className="mr-2 h-4 w-4" />
              {isTestingWebhook ? "Testando..." : "Testar"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Para usar o Zapier, crie um Zap com trigger "Webhooks by Zapier" e copie a URL aqui
          </p>
        </CardContent>
      </Card>

      {/* Lista de Automações */}
      <Card>
        <CardHeader>
          <CardTitle>Automações Configuradas</CardTitle>
          <CardDescription>
            {automations.filter(a => a.isActive).length} de {automations.length} automações ativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Gatilho</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Execuções</TableHead>
                <TableHead>Última Execução</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automations.map((automation) => (
                <TableRow key={automation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{automation.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {automation.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTriggerLabel(automation.trigger)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(automation.action)}
                      {getActionLabel(automation.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {automation.executionCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {automation.lastExecution 
                      ? new Date(automation.lastExecution).toLocaleDateString('pt-BR')
                      : "Nunca"
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={() => toggleAutomation(automation.id)}
                      />
                      <Badge variant={automation.isActive ? "default" : "secondary"}>
                        {automation.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(automation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteAutomation(automation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Automation;
