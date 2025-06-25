
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadPipeline } from "@/components/crm/LeadPipeline";
import { CRMAnalytics } from "@/components/crm/CRMAnalytics";
import CRM from "@/pages/crm/CRM";

const CRMEnhanced = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM Empresarial</h1>
        <p className="text-muted-foreground">
          Sistema completo de gestão de relacionamento com clientes
        </p>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Vendas</CardTitle>
              <CardDescription>
                Acompanhe seus leads através do funil de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadPipeline />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <CRMAnalytics />
        </TabsContent>

        <TabsContent value="clients">
          <CRM />
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Central de Atividades</CardTitle>
              <CardDescription>
                Todas as interações e tarefas em um só lugar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Central de atividades será implementada em breve...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMEnhanced;
