
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { Tenant } from "@/lib/saas-schema";

interface TenantBasicInfoProps {
  tenant: Tenant;
}

export function TenantBasicInfo({ tenant }: TenantBasicInfoProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      trial: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800",
      suspended: "bg-orange-100 text-orange-800",
    };
    
    const labels = {
      active: "Ativo",
      trial: "Trial", 
      inactive: "Inativo",
      suspended: "Suspenso",
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Informações Básicas
          {getStatusBadge(tenant.status)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Contato</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{tenant.email}</span>
              </div>
              {tenant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{tenant.phone}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Documentação</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">CNPJ:</span> {tenant.cnpj}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Plano</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Plano atual:</span> {tenant.plan}
              </div>
              <div>
                <span className="text-gray-600">Máx. usuários:</span> {tenant.maxUsers === -1 ? 'Ilimitado' : tenant.maxUsers}
              </div>
              <div>
                <span className="text-gray-600">Máx. lojas:</span> {tenant.maxStores === -1 ? 'Ilimitado' : tenant.maxStores}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
