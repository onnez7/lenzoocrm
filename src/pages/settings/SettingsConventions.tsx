
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreHorizontal, Edit, Trash2, HeartHandshake, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Convention {
  id: string;
  name: string;
  code: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  discount: number;
  description: string;
  plansCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface Plan {
  id: string;
  conventionId: string;
  conventionName: string;
  name: string;
  code: string;
  discount: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

const mockConventions: Convention[] = [
  {
    id: "1",
    name: "Unimed São Paulo",
    code: "UNIMED-SP",
    contactName: "Maria Silva",
    contactPhone: "(11) 3456-7890",
    contactEmail: "maria.silva@unimed.com.br",
    discount: 15,
    description: "Convênio com a Unimed para atendimento oftalmológico",
    plansCount: 3,
    isActive: true,
    createdAt: new Date("2024-01-10")
  },
  {
    id: "2",
    name: "Bradesco Saúde",
    code: "BRAD-SAUDE",
    contactName: "João Santos",
    contactPhone: "(11) 2345-6789",
    contactEmail: "joao.santos@bradescosaude.com.br",
    discount: 10,
    description: "Parceria para serviços oftalmológicos",
    plansCount: 2,
    isActive: true,
    createdAt: new Date("2024-01-15")
  },
  {
    id: "3",
    name: "Amil",
    code: "AMIL",
    contactName: "Ana Costa",
    contactPhone: "(11) 1234-5678",
    contactEmail: "ana.costa@amil.com.br",
    discount: 12,
    description: "Convênio Amil para consultas e procedimentos",
    plansCount: 4,
    isActive: false,
    createdAt: new Date("2024-01-20")
  }
];

const mockPlans: Plan[] = [
  {
    id: "1",
    conventionId: "1",
    conventionName: "Unimed São Paulo",
    name: "Unimed Básico",
    code: "UNI-BASIC",
    discount: 10,
    description: "Plano básico com consultas e exames",
    isActive: true,
    createdAt: new Date("2024-01-12")
  },
  {
    id: "2",
    conventionId: "1",
    conventionName: "Unimed São Paulo",
    name: "Unimed Premium",
    code: "UNI-PREM",
    discount: 20,
    description: "Plano premium com cobertura completa",
    isActive: true,
    createdAt: new Date("2024-01-12")
  },
  {
    id: "3",
    conventionId: "2",
    conventionName: "Bradesco Saúde",
    name: "Bradesco Executivo",
    code: "BRAD-EXEC",
    discount: 15,
    description: "Plano executivo com desconto diferenciado",
    isActive: true,
    createdAt: new Date("2024-01-16")
  }
];

const SettingsConventions = () => {
  const [conventions, setConventions] = useState<Convention[]>(mockConventions);
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConventionDialogOpen, setIsConventionDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingConvention, setEditingConvention] = useState<Convention | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const [conventionForm, setConventionForm] = useState({
    name: "",
    code: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    discount: "",
    description: ""
  });

  const [planForm, setPlanForm] = useState({
    conventionId: "",
    name: "",
    code: "",
    discount: "",
    description: ""
  });

  const filteredConventions = conventions.filter(convention =>
    convention.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convention.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.conventionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetConventionForm = () => {
    setConventionForm({
      name: "",
      code: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      discount: "",
      description: ""
    });
    setEditingConvention(null);
  };

  const resetPlanForm = () => {
    setPlanForm({
      conventionId: "",
      name: "",
      code: "",
      discount: "",
      description: ""
    });
    setEditingPlan(null);
  };

  const handleConventionSubmit = () => {
    if (editingConvention) {
      setConventions(prev => prev.map(conv => 
        conv.id === editingConvention.id 
          ? { 
              ...conv, 
              ...conventionForm,
              discount: parseFloat(conventionForm.discount)
            }
          : conv
      ));
      toast({
        title: "Convênio atualizado",
        description: "O convênio foi atualizado com sucesso.",
      });
    } else {
      const newConvention: Convention = {
        id: Date.now().toString(),
        ...conventionForm,
        discount: parseFloat(conventionForm.discount),
        plansCount: 0,
        isActive: true,
        createdAt: new Date()
      };
      setConventions(prev => [...prev, newConvention]);
      toast({
        title: "Convênio criado",
        description: "O novo convênio foi criado com sucesso.",
      });
    }
    
    resetConventionForm();
    setIsConventionDialogOpen(false);
  };

  const handlePlanSubmit = () => {
    const convention = conventions.find(c => c.id === planForm.conventionId);
    if (!convention) return;

    if (editingPlan) {
      setPlans(prev => prev.map(plan => 
        plan.id === editingPlan.id 
          ? { 
              ...plan, 
              ...planForm,
              conventionName: convention.name,
              discount: parseFloat(planForm.discount)
            }
          : plan
      ));
      toast({
        title: "Plano atualizado",
        description: "O plano foi atualizado com sucesso.",
      });
    } else {
      const newPlan: Plan = {
        id: Date.now().toString(),
        ...planForm,
        conventionName: convention.name,
        discount: parseFloat(planForm.discount),
        isActive: true,
        createdAt: new Date()
      };
      setPlans(prev => [...prev, newPlan]);
      
      // Atualizar contador de planos no convênio
      setConventions(prev => prev.map(conv => 
        conv.id === planForm.conventionId 
          ? { ...conv, plansCount: conv.plansCount + 1 }
          : conv
      ));

      toast({
        title: "Plano criado",
        description: "O novo plano foi criado com sucesso.",
      });
    }
    
    resetPlanForm();
    setIsPlanDialogOpen(false);
  };

  const handleEditConvention = (convention: Convention) => {
    setEditingConvention(convention);
    setConventionForm({
      name: convention.name,
      code: convention.code,
      contactName: convention.contactName,
      contactPhone: convention.contactPhone,
      contactEmail: convention.contactEmail,
      discount: convention.discount.toString(),
      description: convention.description
    });
    setIsConventionDialogOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      conventionId: plan.conventionId,
      name: plan.name,
      code: plan.code,
      discount: plan.discount.toString(),
      description: plan.description
    });
    setIsPlanDialogOpen(true);
  };

  const toggleConventionStatus = (id: string) => {
    setConventions(prev => prev.map(conv => 
      conv.id === id ? { ...conv, isActive: !conv.isActive } : conv
    ));
  };

  const togglePlanStatus = (id: string) => {
    setPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Convênios e Planos</h1>
        <p className="text-muted-foreground">
          Gerencie convênios médicos e planos de saúde
        </p>
      </div>

      <Tabs defaultValue="conventions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="conventions">Convênios</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
        </TabsList>

        {/* Aba de Convênios */}
        <TabsContent value="conventions">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar convênios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <Dialog open={isConventionDialogOpen} onOpenChange={setIsConventionDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetConventionForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Convênio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingConvention ? "Editar Convênio" : "Novo Convênio"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingConvention ? "Edite os dados do convênio." : "Adicione um novo convênio médico."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome do Convênio</Label>
                        <Input
                          id="name"
                          value={conventionForm.name}
                          onChange={(e) => setConventionForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Unimed São Paulo"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="code">Código</Label>
                        <Input
                          id="code"
                          value={conventionForm.code}
                          onChange={(e) => setConventionForm(prev => ({ ...prev, code: e.target.value }))}
                          placeholder="Ex: UNIMED-SP"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="contactName">Contato</Label>
                        <Input
                          id="contactName"
                          value={conventionForm.contactName}
                          onChange={(e) => setConventionForm(prev => ({ ...prev, contactName: e.target.value }))}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contactPhone">Telefone</Label>
                        <Input
                          id="contactPhone"
                          value={conventionForm.contactPhone}
                          onChange={(e) => setConventionForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                          placeholder="(11) 3456-7890"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contactEmail">E-mail</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={conventionForm.contactEmail}
                          onChange={(e) => setConventionForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="contato@convenio.com.br"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="discount">Desconto Padrão (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={conventionForm.discount}
                        onChange={(e) => setConventionForm(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={conventionForm.description}
                        onChange={(e) => setConventionForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição do convênio"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsConventionDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleConventionSubmit} disabled={!conventionForm.name.trim()}>
                      {editingConvention ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5" />
                  Convênios Médicos
                </CardTitle>
                <CardDescription>
                  {filteredConventions.length} convênios cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Convênio</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Planos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConventions.map((convention) => (
                      <TableRow key={convention.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{convention.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Código: {convention.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{convention.contactName}</div>
                            <div className="text-sm text-muted-foreground">
                              {convention.contactPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {convention.discount}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {convention.plansCount} planos
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={convention.isActive ? "default" : "secondary"}>
                            {convention.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                              <DropdownMenuItem onClick={() => handleEditConvention(convention)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleConventionStatus(convention.id)}>
                                {convention.isActive ? "Desativar" : "Ativar"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Planos */}
        <TabsContent value="plans">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar planos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetPlanForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Plano
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPlan ? "Editar Plano" : "Novo Plano"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPlan ? "Edite os dados do plano." : "Adicione um novo plano de saúde."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="conventionId">Convênio</Label>
                      <select
                        id="conventionId"
                        value={planForm.conventionId}
                        onChange={(e) => setPlanForm(prev => ({ ...prev, conventionId: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="">Selecione um convênio</option>
                        {conventions.filter(c => c.isActive).map(convention => (
                          <option key={convention.id} value={convention.id}>
                            {convention.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="planName">Nome do Plano</Label>
                        <Input
                          id="planName"
                          value={planForm.name}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Unimed Básico"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="planCode">Código</Label>
                        <Input
                          id="planCode"
                          value={planForm.code}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, code: e.target.value }))}
                          placeholder="Ex: UNI-BASIC"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="planDiscount">Desconto (%)</Label>
                      <Input
                        id="planDiscount"
                        type="number"
                        value={planForm.discount}
                        onChange={(e) => setPlanForm(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="planDescription">Descrição</Label>
                      <Textarea
                        id="planDescription"
                        value={planForm.description}
                        onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição do plano"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handlePlanSubmit} 
                      disabled={!planForm.name.trim() || !planForm.conventionId}
                    >
                      {editingPlan ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Planos de Saúde
                </CardTitle>
                <CardDescription>
                  {filteredPlans.length} planos cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plano</TableHead>
                      <TableHead>Convênio</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Código: {plan.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {plan.conventionName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {plan.discount}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                              <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => togglePlanStatus(plan.id)}>
                                {plan.isActive ? "Desativar" : "Ativar"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsConventions;
