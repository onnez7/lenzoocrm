
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadPipeline } from "@/components/crm/LeadPipeline";
import { CRMAnalytics } from "@/components/crm/CRMAnalytics";
import { CRMExecutiveDashboard } from "@/components/crm/CRMExecutiveDashboard";
import { OpportunityManagement } from "@/components/crm/OpportunityManagement";
import { SalesAutomation } from "@/components/crm/SalesAutomation";
import CRM from "@/pages/crm/CRM";
import { Plus, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CRMEnhanced = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Empresarial Avançado</h1>
          <p className="text-muted-foreground">
            Sistema completo de gestão empresarial de relacionamento com clientes
          </p>
        </div>
        <Button onClick={() => navigate('/crm/new-rule')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard Executivo</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CRMExecutiveDashboard />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunityManagement />
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Vendas Interativo</CardTitle>
              <CardDescription>
                Arraste e solte leads entre os estágios do funil de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadPipeline />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Automação de Vendas</h2>
                <p className="text-muted-foreground">
                  Configure regras para automatizar seu processo de vendas
                </p>
              </div>
              <Button onClick={() => navigate('/crm/new-rule')}>
                <Zap className="mr-2 h-4 w-4" />
                Nova Regra de Automação
              </Button>
            </div>
            <SalesAutomation />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <CRMAnalytics />
        </TabsContent>

        <TabsContent value="clients">
          <CRM />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMEnhanced;
