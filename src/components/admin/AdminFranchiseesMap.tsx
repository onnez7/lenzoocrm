
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockTenants } from "@/lib/saas-schema";
import { MapPin, Eye, Edit, MoreHorizontal } from "lucide-react";

export function AdminFranchiseesMap() {
  const franchiseesByRegion = {
    'Sudeste': mockTenants.filter(t => ['SP', 'RJ', 'MG'].includes(t.state || 'SP')),
    'Sul': mockTenants.filter(t => ['RS', 'SC', 'PR'].includes(t.state || '')),
    'Nordeste': mockTenants.filter(t => ['BA', 'PE', 'CE'].includes(t.state || '')),
    'Norte': mockTenants.filter(t => ['AM', 'PA'].includes(t.state || '')),
    'Centro-Oeste': mockTenants.filter(t => ['GO', 'MT', 'MS'].includes(t.state || ''))
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      trial: "bg-yellow-100 text-yellow-800", 
      inactive: "bg-red-100 text-red-800",
      suspended: "bg-orange-100 text-orange-800"
    };
    
    const labels = {
      active: "Ativo",
      trial: "Trial",
      inactive: "Inativo", 
      suspended: "Suspenso"
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
      enterprise: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={styles[plan as keyof typeof styles]}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Regional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(franchiseesByRegion).map(([region, franchisees]) => (
          <Card key={region} className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{region}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {franchisees.length}
              </div>
              <p className="text-sm text-gray-600">franqueados</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Franchisees List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Todos os Franqueados
          </CardTitle>
          <CardDescription>
            Lista completa com status, planos e métricas principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTenants.map((tenant) => (
              <div key={tenant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">{tenant.name}</h3>
                      {getStatusBadge(tenant.status)}
                      {getPlanBadge(tenant.plan)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{tenant.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">CNPJ:</span>
                        <p className="text-gray-900">{tenant.cnpj}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Criado em:</span>
                        <p className="text-gray-900">{tenant.createdAt.toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Usuários:</span>
                        <p className="text-gray-900">
                          {tenant.maxUsers === -1 ? 'Ilimitado' : `${tenant.maxUsers} usuários`}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Receita Mensal:</span>
                        <Badge variant="outline" className="text-green-600">
                          R$ {tenant.plan === 'basic' ? '99,90' : tenant.plan === 'premium' ? '199,90' : '399,90'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Última Atividade:</span>
                        <span className="text-gray-900">2 horas atrás</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Uso:</span>
                        <span className="text-gray-900">78% do limite</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Suporte:</span>
                        <Badge variant="outline" className="text-blue-600">
                          2 tickets
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
