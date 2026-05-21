
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpportunityManagement } from "@/components/crm/OpportunityManagement";
import CRM from "@/pages/crm/CRM";

const CRMEnhanced = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM Empresarial Avançado</h1>
        <p className="text-muted-foreground">
          Sistema completo de gestão empresarial de relacionamento com clientes
        </p>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          <OpportunityManagement />
        </TabsContent>

        <TabsContent value="clients">
          <CRM />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMEnhanced;
