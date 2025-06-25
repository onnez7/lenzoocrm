
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Zap,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Target,
  Users,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Trigger {
  id: string;
  type: 'stage_change' | 'time_based' | 'lead_score' | 'activity';
  condition: string;
  value: string;
}

interface Action {
  id: string;
  type: 'send_email' | 'make_call' | 'send_sms' | 'assign_lead' | 'move_stage' | 'create_task';
  description: string;
  config: Record<string, any>;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: Trigger[];
  actions: Action[];
  createdAt: Date;
}

const triggerTypes = [
  { value: 'stage_change', label: 'Mudança de Estágio', icon: Target },
  { value: 'time_based', label: 'Baseado em Tempo', icon: Clock },
  { value: 'lead_score', label: 'Pontuação do Lead', icon: Users },
  { value: 'activity', label: 'Atividade Específica', icon: Calendar }
];

const actionTypes = [
  { value: 'send_email', label: 'Enviar Email', icon: Mail },
  { value: 'make_call', label: 'Fazer Ligação', icon: Phone },
  { value: 'send_sms', label: 'Enviar SMS', icon: MessageSquare },
  { value: 'assign_lead', label: 'Atribuir Lead', icon: Users },
  { value: 'move_stage', label: 'Mover Estágio', icon: Target },
  { value: 'create_task', label: 'Criar Tarefa', icon: Calendar }
];

export default function NewRule() {
  const navigate = useNavigate();
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  const addTrigger = () => {
    const newTrigger: Trigger = {
      id: Date.now().toString(),
      type: 'stage_change',
      condition: '',
      value: ''
    };
    setTriggers([...triggers, newTrigger]);
  };

  const removeTrigger = (id: string) => {
    setTriggers(triggers.filter(trigger => trigger.id !== id));
  };

  const updateTrigger = (id: string, field: keyof Trigger, value: string) => {
    setTriggers(triggers.map(trigger =>
      trigger.id === id ? { ...trigger, [field]: value } : trigger
    ));
  };

  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      type: 'send_email',
      description: '',
      config: {}
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(action => action.id !== id));
  };

  const updateAction = (id: string, field: keyof Action, value: string) => {
    setActions(actions.map(action =>
      action.id === id ? { ...action, [field]: value } : action
    ));
  };

  const saveRule = () => {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      name: ruleName,
      description: ruleDescription,
      isActive: true,
      triggers,
      actions,
      createdAt: new Date()
    };

    console.log('Nova regra criada:', newRule);
    
    // Aqui você salvaria a regra no backend
    // Por enquanto, apenas navegamos de volta
    navigate('/crm');
  };

  const getTriggerIcon = (type: string) => {
    const triggerType = triggerTypes.find(t => t.value === type);
    return triggerType?.icon || Target;
  };

  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find(t => t.value === type);
    return actionType?.icon || Mail;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Regra de Automação</h1>
          <p className="text-muted-foreground">
            Configure gatilhos e ações para automatizar seu processo de vendas
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="triggers">Gatilhos</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="preview">Visualizar</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Regra</CardTitle>
              <CardDescription>
                Defina o nome e descrição da sua regra de automação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">Nome da Regra</Label>
                <Input
                  id="ruleName"
                  placeholder="Ex: Acompanhar leads em negociação"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleDescription">Descrição</Label>
                <Textarea
                  id="ruleDescription"
                  placeholder="Descreva o que esta regra faz..."
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gatilhos</span>
                <Button onClick={addTrigger}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Gatilho
                </Button>
              </CardTitle>
              <CardDescription>
                Defina quando esta regra deve ser executada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {triggers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum gatilho configurado. Clique em "Adicionar Gatilho" para começar.
                </p>
              ) : (
                triggers.map((trigger) => {
                  const TriggerIcon = getTriggerIcon(trigger.type);
                  return (
                    <Card key={trigger.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <TriggerIcon className="mt-1 h-5 w-5 text-blue-600" />
                        <div className="flex-1 space-y-3">
                          <Select
                            value={trigger.type}
                            onValueChange={(value) => updateTrigger(trigger.id, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de gatilho" />
                            </SelectTrigger>
                            <SelectContent>
                              {triggerTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Input
                            placeholder="Condição (ex: lead está em 'Negociação' por mais de 3 dias)"
                            value={trigger.condition}
                            onChange={(e) => updateTrigger(trigger.id, 'condition', e.target.value)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTrigger(trigger.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ações</span>
                <Button onClick={addAction}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Ação
                </Button>
              </CardTitle>
              <CardDescription>
                Defina o que deve acontecer quando os gatilhos forem ativados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma ação configurada. Clique em "Adicionar Ação" para começar.
                </p>
              ) : (
                actions.map((action) => {
                  const ActionIcon = getActionIcon(action.type);
                  return (
                    <Card key={action.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <ActionIcon className="mt-1 h-5 w-5 text-green-600" />
                        <div className="flex-1 space-y-3">
                          <Select
                            value={action.type}
                            onValueChange={(value) => updateAction(action.id, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de ação" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Input
                            placeholder="Descrição da ação (ex: enviar email de acompanhamento)"
                            value={action.description}
                            onChange={(e) => updateAction(action.id, 'description', e.target.value)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAction(action.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Visualização da Regra
              </CardTitle>
              <CardDescription>
                Revise sua regra antes de salvar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Nome da Regra</h3>
                <p className="text-muted-foreground">{ruleName || 'Sem nome'}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Descrição</h3>
                <p className="text-muted-foreground">{ruleDescription || 'Sem descrição'}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Gatilhos ({triggers.length})</h3>
                <div className="space-y-2">
                  {triggers.map((trigger) => (
                    <Badge key={trigger.id} variant="outline" className="mr-2">
                      {triggerTypes.find(t => t.value === trigger.type)?.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Ações ({actions.length})</h3>
                <div className="space-y-2">
                  {actions.map((action) => (
                    <Badge key={action.id} variant="outline" className="mr-2">
                      {actionTypes.find(t => t.value === action.type)?.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveRule} disabled={!ruleName || triggers.length === 0 || actions.length === 0}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Regra
                </Button>
                <Button variant="outline" onClick={() => navigate('/crm')}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
