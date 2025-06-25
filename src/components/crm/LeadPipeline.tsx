
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  Target
} from "lucide-react";

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

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@empresa.com",
    phone: "(11) 99999-9999",
    company: "Empresa ABC",
    value: 5000,
    probability: 80,
    stage: "Proposta",
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
    stage: "Negociação",
    lastContact: new Date("2024-01-09"),
    source: "Indicação",
    assignedTo: "Carlos Oliveira"
  }
];

const stages = [
  { name: "Prospecto", color: "bg-gray-100" },
  { name: "Qualificado", color: "bg-blue-100" },
  { name: "Proposta", color: "bg-yellow-100" },
  { name: "Negociação", color: "bg-orange-100" },
  { name: "Fechado", color: "bg-green-100" }
];

export function LeadPipeline() {
  const getStageColor = (stage: string) => {
    const stageObj = stages.find(s => s.name === stage);
    return stageObj?.color || "bg-gray-100";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageLeads = mockLeads.filter(lead => lead.stage === stage.name);
          const stageValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0);
          
          return (
            <Card key={stage.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {stage.name}
                  <Badge variant="outline">{stageLeads.length}</Badge>
                </CardTitle>
                <div className="text-lg font-bold">
                  R$ {stageValue.toLocaleString('pt-BR')}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageLeads.map((lead) => (
                  <Card key={lead.id} className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${getStageColor(lead.stage)}`}>
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
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
