import { useEffect, useState } from "react";
import { opportunityService, Opportunity } from "@/services/opportunityService";
import { clientPaymentService, ClientPayment } from "@/services/clientPaymentService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, User, MessageSquare, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { userService, UserProfile } from "@/services/userService";
import { format, isBefore, isAfter, addDays, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { opportunityActivityService, OpportunityActivity, CreateActivityPayload } from "@/services/opportunityActivityService";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STAGES = [
  { id: "prospect", name: "Prospecto" },
  { id: "qualificado", name: "Qualificado" },
  { id: "proposta", name: "Proposta" },
  { id: "negociacao", name: "Negociação" },
  { id: "fechado", name: "Fechado" }
];

function getPaymentStatusBadge(status: string | undefined) {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Pago</Badge>;
    case "overdue":
      return <Badge className="bg-red-100 text-red-800 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Vencido</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Em aberto</Badge>;
    default:
      return <Badge variant="outline">Sem cobrança</Badge>;
  }
}

function getResponsibleName(responsible_id?: number, users: UserProfile[] = []): string {
  if (!responsible_id) return "-";
  const user = users.find(u => u.id === responsible_id);
  return user ? user.name : `ID ${responsible_id}`;
}

function getExtraBadges(opportunity: Opportunity) {
  const badges = [];
  if (opportunity.expected_close) {
    const closeDate = parseISO(opportunity.expected_close);
    const now = new Date();
    if (isBefore(closeDate, now)) {
      badges.push(<Badge key="late" className="bg-red-100 text-red-800 ml-1">Atrasada</Badge>);
    } else if (isBefore(closeDate, addDays(now, 3))) {
      badges.push(<Badge key="soon" className="bg-yellow-100 text-yellow-800 ml-1">Vencendo</Badge>);
    }
  }
  if (opportunity.status === 'high') {
    badges.push(<Badge key="priority" className="bg-orange-100 text-orange-800 ml-1">Alta prioridade</Badge>);
  }
  return badges;
}

function KanbanCard({ opportunity, paymentStatus, users }: { opportunity: Opportunity, paymentStatus?: string, users: UserProfile[] }) {
  // Modal de agendamento
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<OpportunityActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [activitySearch, setActivitySearch] = useState("");
  
  // Formulário de nova atividade
  const [formData, setFormData] = useState<CreateActivityPayload>({
    title: "",
    description: "",
    activity_type: "task",
    priority: "medium",
    due_date: "",
    due_time: "",
    notes: ""
  });

  const { token } = useAuth();
  const { toast } = useToast();
  const clientPhone = opportunity.client_phone || "";
  const clientEmail = opportunity.client_email || "";
  const whatsappUrl = clientPhone ? `https://wa.me/${clientPhone.replace(/\D/g, "")}` : undefined;
  const mailtoUrl = clientEmail ? `mailto:${clientEmail}` : undefined;

  // Buscar atividades da oportunidade
  const fetchActivities = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await opportunityActivityService.getOpportunityActivities(opportunity.id, token, { status: activityFilter !== "all" ? activityFilter : undefined });
      setActivities(data);
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao buscar atividades", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Salvar nova atividade
  const saveActivity = async () => {
    if (!token || !formData.title.trim()) return;
    setSaving(true);
    try {
      await opportunityActivityService.createActivity(opportunity.id, formData, token);
      toast({ title: "Sucesso", description: "Atividade criada com sucesso!" });
      setFormData({
        title: "",
        description: "",
        activity_type: "task",
        priority: "medium",
        due_date: "",
        due_time: "",
        notes: ""
      });
      fetchActivities();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao criar atividade", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Atualizar status da atividade
  const updateActivityStatus = async (activityId: number, newStatus: string) => {
    if (!token) return;
    try {
      await opportunityActivityService.updateActivityStatus(activityId, newStatus, token);
      toast({ title: "Status atualizado!" });
      fetchActivities();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  // Deletar atividade
  const deleteActivity = async (activityId: number) => {
    if (!token) return;
    try {
      await opportunityActivityService.deleteActivity(activityId, token);
      toast({ title: "Atividade deletada!" });
      fetchActivities();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao deletar atividade", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (open) {
      fetchActivities();
    }
  }, [open, activityFilter]);

  // Contador de atividades pendentes
  const pendingActivities = activities.filter(a => a.status === 'pending' || a.status === 'in_progress').length;

  // Filtro de atividades por busca
  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
    (activity.description && activity.description.toLowerCase().includes(activitySearch.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="mb-3">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex-1 truncate">{opportunity.title}</CardTitle>
        <Badge variant="outline">R$ {opportunity.value.toLocaleString('pt-BR')}</Badge>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" /> {opportunity.client_name || opportunity.client_id}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Responsável:</span> <span className="font-medium">{getResponsibleName(opportunity.responsible_id, users)}</span>
        </div>
        {opportunity.expected_close && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Prev. fechamento:</span> <span>{format(parseISO(opportunity.expected_close), 'dd/MM/yyyy')}</span>
          </div>
        )}
        <div className="mt-1 flex flex-wrap gap-1">{getPaymentStatusBadge(paymentStatus)}{getExtraBadges(opportunity)}</div>
        <div className="flex gap-1 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            title={clientPhone ? "Abrir WhatsApp" : "Telefone não disponível"}
            asChild
            disabled={!clientPhone}
          >
            {clientPhone ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-3 w-3" />
              </a>
            ) : (
              <MessageSquare className="h-3 w-3 opacity-50" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            title={clientEmail ? "Enviar e-mail" : "E-mail não disponível"}
            asChild
            disabled={!clientEmail}
          >
            {clientEmail ? (
              <a href={mailtoUrl} target="_blank" rel="noopener noreferrer">
                <Mail className="h-3 w-3" />
              </a>
            ) : (
              <Mail className="h-3 w-3 opacity-50" />
            )}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-6 px-2 text-xs relative" title="Gerenciar atividades">
                <Calendar className="h-3 w-3" />
                {pendingActivities > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white">
                    {pendingActivities}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
              <DialogHeader>
                <DialogTitle>Atividades da Oportunidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Filtros e busca */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Buscar atividades..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de atividades existentes */}
                <div className="space-y-2">
                  <h3 className="font-medium">Atividades ({filteredActivities.length})</h3>
                  {loading ? (
                    <div className="text-center py-4">Carregando...</div>
                  ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {activitySearch ? "Nenhuma atividade encontrada" : "Nenhuma atividade encontrada"}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredActivities.map((activity) => (
                        <Card key={activity.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium truncate">{activity.title}</span>
                                <Badge className={getStatusColor(activity.status)}>
                                  {activity.status === 'completed' ? 'Concluída' : 
                                   activity.status === 'in_progress' ? 'Em andamento' :
                                   activity.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                                </Badge>
                                <Badge className={getPriorityColor(activity.priority)}>
                                  {activity.priority === 'urgent' ? 'Urgente' :
                                   activity.priority === 'high' ? 'Alta' :
                                   activity.priority === 'low' ? 'Baixa' : 'Média'}
                                </Badge>
                              </div>
                              {activity.description && (
                                <p className="text-sm text-muted-foreground mb-1 break-words">{activity.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                {activity.due_date && (
                                  <span>Vencimento: {format(parseISO(activity.due_date), 'dd/MM/yyyy')}</span>
                                )}
                                {activity.assigned_to_name && (
                                  <span>Responsável: {activity.assigned_to_name}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2 flex-shrink-0">
                              {activity.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateActivityStatus(activity.id, 'completed')}
                                  className="h-6 px-2 text-xs"
                                >
                                  ✓
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteActivity(activity.id)}
                                className="h-6 px-2 text-xs text-red-600"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulário de nova atividade */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Nova Atividade</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Título da atividade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Descrição da atividade"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="activity_type">Tipo</Label>
                        <Select value={formData.activity_type} onValueChange={(value) => setFormData({...formData, activity_type: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="task">Tarefa</SelectItem>
                            <SelectItem value="call">Ligação</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="meeting">Reunião</SelectItem>
                            <SelectItem value="note">Anotação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="due_date">Data de vencimento</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="due_time">Horário</Label>
                        <Input
                          id="due_time"
                          type="time"
                          value={formData.due_time}
                          onChange={(e) => setFormData({...formData, due_time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Observações adicionais"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveActivity} disabled={saving || !formData.title.trim()}>
                        {saving ? "Salvando..." : "Criar Atividade"}
                      </Button>
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Fechar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export function OpportunityKanban() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [responsible, setResponsible] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  // Buscar usuários para mapear responsáveis
  const fetchUsers = async () => {
    if (!token) return;
    try {
      const data = await userService.getAllUsers(token);
      setUsers(data);
    } catch {}
  };

  const fetchOpportunities = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await opportunityService.getAll(token);
      setOpportunities(data);
    } catch {
      toast({ title: "Erro", description: "Erro ao buscar oportunidades", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!token) return;
    try {
      const data = await clientPaymentService.getAll(token);
      setPayments(data);
    } catch {
      // Não mostrar toast para não poluir
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchPayments();
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  // DnD-kit setup
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    const oppId = parseInt(active.id as string);
    const newStage = over.id as string;
    const opp = opportunities.find(o => o.id === oppId);
    if (opp && opp.stage !== newStage) {
      try {
        await opportunityService.moveStage(oppId, newStage, token!);
        fetchOpportunities();
        toast({ title: "Oportunidade movida!" });
      } catch {
        toast({ title: "Erro ao mover oportunidade", variant: "destructive" });
      }
    }
  };

  // Mapeia status de pagamento por client_id
  function getPaymentStatusForClient(client_id: number): string | undefined {
    const clientPayments = payments.filter(p => p.client_id === client_id);
    if (clientPayments.some(p => p.status === "overdue")) return "overdue";
    if (clientPayments.some(p => p.status === "pending")) return "pending";
    if (clientPayments.some(p => p.status === "paid")) return "paid";
    return undefined;
  }

  // Responsáveis únicos (nome)
  const responsibles = Array.from(new Set(opportunities.map(o => o.responsible_id))).filter(Boolean);
  const responsibleOptions = responsibles.map(rid => {
    const user = users.find(u => u.id === Number(rid));
    return { id: rid, name: user ? user.name : `ID ${rid}` };
  });

  // Filtro de oportunidades
  const filteredOpportunities = opportunities.filter(o => {
    const payment = getPaymentStatusForClient(o.client_id);
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.client_name && o.client_name.toLowerCase().includes(search.toLowerCase()));
    const matchesResponsible = responsible === "all" || (o.responsible_id && o.responsible_id.toString() === responsible);
    const matchesPayment = paymentStatus === "all" || payment === paymentStatus;
    const matchesMin = !minValue || o.value >= Number(minValue);
    const matchesMax = !maxValue || o.value <= Number(maxValue);
    return matchesSearch && matchesResponsible && matchesPayment && matchesMin && matchesMax;
  });

  return (
    <div className="space-y-4">
      {/* Filtros e busca */}
      <div className="flex flex-wrap gap-2 items-end mb-2">
        <Input
          placeholder="Buscar por nome, empresa ou título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={responsible} onValueChange={setResponsible}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os responsáveis</SelectItem>
            {responsibleOptions.map(r => (
              <SelectItem key={r.id} value={r.id?.toString()}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="pending">Em aberto</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
            <SelectItem value="undefined">Sem cobrança</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Valor mín."
          type="number"
          value={minValue}
          onChange={e => setMinValue(e.target.value)}
          className="w-28"
        />
        <Input
          placeholder="Valor máx."
          type="number"
          value={maxValue}
          onChange={e => setMaxValue(e.target.value)}
          className="w-28"
        />
      </div>
      <div className="flex gap-4 overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {STAGES.map(stage => {
            const stageOpportunities = filteredOpportunities.filter(o => o.stage === stage.id);
            return (
              <div key={stage.id} className="min-w-[300px] w-80 bg-gray-50 rounded-lg p-2 border flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{stage.name}</span>
                  <Badge variant="secondary">{stageOpportunities.length}</Badge>
                </div>
                <SortableContext items={stageOpportunities.map(o => o.id.toString())} strategy={verticalListSortingStrategy}>
                  {stageOpportunities.map(opp => (
                    <div key={opp.id} id={opp.id.toString()} style={{ marginBottom: 8, cursor: 'grab' }}>
                      <KanbanCard opportunity={opp} paymentStatus={getPaymentStatusForClient(opp.client_id)} users={users} />
                    </div>
                  ))}
                </SortableContext>
                {loading && <div className="text-xs text-muted-foreground text-center mt-2">Carregando...</div>}
                {!loading && stageOpportunities.length === 0 && <div className="text-xs text-muted-foreground text-center mt-2">Nenhuma oportunidade</div>}
              </div>
            );
          })}
        </DndContext>
      </div>
    </div>
  );
} 