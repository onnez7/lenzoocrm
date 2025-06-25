
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  Clock,
  Plus,
  X,
  Settings
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  value: number;
  probability: number;
  stage: string;
  lastContact: Date;
  source: string;
  assignedTo: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@empresa.com",
    phone: "(11) 99999-9999",
    company: "Empresa ABC",
    value: 5000,
    probability: 80,
    stage: "proposta",
    lastContact: new Date("2024-01-10"),
    source: "Website",
    assignedTo: "Maria Santos"
  },
  {
    id: "2",
    name: "Ana Costa",
    email: "ana@startup.com",
    phone: "(11) 88888-8888",
    company: "Startup XYZ",
    value: 12000,
    probability: 60,
    stage: "negociacao",
    lastContact: new Date("2024-01-09"),
    source: "Indicação",
    assignedTo: "Carlos Oliveira"
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro@tech.com",
    phone: "(11) 77777-7777",
    company: "Tech Corp",
    value: 8500,
    probability: 45,
    stage: "qualificado",
    lastContact: new Date("2024-01-08"),
    source: "LinkedIn",
    assignedTo: "Ana Costa"
  }
];

const defaultStages: Stage[] = [
  { id: "prospecto", name: "Prospecto", color: "bg-gray-100", order: 1 },
  { id: "qualificado", name: "Qualificado", color: "bg-blue-100", order: 2 },
  { id: "proposta", name: "Proposta", color: "bg-yellow-100", order: 3 },
  { id: "negociacao", name: "Negociação", color: "bg-orange-100", order: 4 },
  { id: "fechado", name: "Fechado", color: "bg-green-100", order: 5 }
];

function SortableLeadCard({ lead }: { lead: Lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="p-3 cursor-grab hover:shadow-md transition-shadow bg-white border"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{lead.name}</h4>
          <Badge variant="outline" className="text-xs">
            {lead.probability}%
          </Badge>
        </div>
        
        {lead.company && (
          <p className="text-xs text-gray-600">{lead.company}</p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <DollarSign className="h-3 w-3" />
          R$ {lead.value.toLocaleString('pt-BR')}
        </div>
        
        <Progress value={lead.probability} className="h-1" />
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {lead.lastContact.toLocaleDateString('pt-BR')}
        </div>
        
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
            <Phone className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
            <Mail className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
            <Calendar className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function LeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [stages, setStages] = useState<Stage[]>(defaultStages);
  const [newStageName, setNewStageName] = useState("");
  const [isAddingStage, setIsAddingStage] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se o item foi solto em uma coluna (stage)
    if (stages.find(stage => stage.id === overId)) {
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === activeId ? { ...lead, stage: overId } : lead
        )
      );
    }
  };

  const addNewStage = () => {
    if (!newStageName.trim()) return;

    const newStage: Stage = {
      id: newStageName.toLowerCase().replace(/\s+/g, '-'),
      name: newStageName,
      color: "bg-purple-100",
      order: stages.length + 1
    };

    setStages([...stages, newStage]);
    setNewStageName("");
    setIsAddingStage(false);
  };

  const removeStage = (stageId: string) => {
    if (stages.length <= 2) return; // Mínimo de 2 colunas
    
    // Move todos os leads dessa stage para a primeira stage
    const firstStageId = stages[0].id;
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.stage === stageId ? { ...lead, stage: firstStageId } : lead
      )
    );
    
    setStages(stages.filter(stage => stage.id !== stageId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline de Vendas</h2>
        <Dialog open={isAddingStage} onOpenChange={setIsAddingStage}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Coluna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Coluna</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome da nova coluna"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewStage()}
              />
              <div className="flex gap-2">
                <Button onClick={addNewStage} disabled={!newStageName.trim()}>
                  Adicionar
                </Button>
                <Button variant="outline" onClick={() => setIsAddingStage(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
          {stages.map((stage) => {
            const stageLeads = leads.filter(lead => lead.stage === stage.id);
            const stageValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0);
            
            return (
              <Card key={stage.id} className="min-h-96">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stage.name}
                      <Badge variant="outline">{stageLeads.length}</Badge>
                    </div>
                    {stages.length > 2 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStage(stage.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </CardTitle>
                  <div className="text-lg font-bold">
                    R$ {stageValue.toLocaleString('pt-BR')}
                  </div>
                </CardHeader>
                <CardContent 
                  className="space-y-3 min-h-80"
                  onDrop={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <SortableContext 
                    items={stageLeads.map(lead => lead.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {stageLeads.map((lead) => (
                      <SortableLeadCard key={lead.id} lead={lead} />
                    ))}
                  </SortableContext>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
