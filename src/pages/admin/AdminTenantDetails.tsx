
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTenants, Tenant } from "@/lib/saas-schema";
import { BestSellingProducts } from "@/components/admin/BestSellingProducts";
import { TenantHeader } from "@/components/admin/tenant/TenantHeader";
import { TenantBasicInfo } from "@/components/admin/tenant/TenantBasicInfo";
import { TenantUsageMetrics } from "@/components/admin/tenant/TenantUsageMetrics";
import { TenantBilling } from "@/components/admin/tenant/TenantBilling";
import { TenantSupport } from "@/components/admin/tenant/TenantSupport";

export default function AdminTenantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant] = useState<Tenant | undefined>(
    mockTenants.find(t => t.id === id)
  );

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Franqueado não encontrado</h2>
        <Button onClick={() => navigate('/admin/tenants')} className="mt-4">
          Voltar para lista
        </Button>
      </div>
    );
  }

  const handleNavigateBack = () => {
    navigate('/admin/tenants');
  };

  return (
    <div className="space-y-6">
      <TenantHeader tenant={tenant} onNavigateBack={handleNavigateBack} />
      
      <TenantBasicInfo tenant={tenant} />

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Uso & Métricas</TabsTrigger>
          <TabsTrigger value="products">Produtos Mais Vendidos</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <TenantUsageMetrics />
        </TabsContent>

        <TabsContent value="products">
          <BestSellingProducts tenantId={tenant.id} tenantName={tenant.name} />
        </TabsContent>

        <TabsContent value="billing">
          <TenantBilling />
        </TabsContent>

        <TabsContent value="support">
          <TenantSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
