
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockTenants, Tenant } from "@/lib/saas-schema";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminTenants() {
  const [tenants] = useState<Tenant[]>(mockTenants);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.cnpj.includes(searchTerm)
  );

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

  const getPlanBadge = (plan: string) => {
    const styles = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
      enterprise: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={styles[plan as keyof typeof styles]}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquilinos</h1>
          <p className="text-gray-600 mt-2">Gerencie todos os inquilinos do sistema</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Inquilino
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inquilinos</CardTitle>
          <CardDescription>
            {filteredTenants.length} inquilino(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{tenant.name}</h3>
                      {getStatusBadge(tenant.status)}
                      {getPlanBadge(tenant.plan)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span> {tenant.email}
                      </div>
                      <div>
                        <span className="font-medium">CNPJ:</span> {tenant.cnpj}
                      </div>
                      <div>
                        <span className="font-medium">Criado em:</span> {tenant.createdAt.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                      <div>
                        <span className="font-medium">Usuários:</span> {tenant.maxUsers === -1 ? 'Ilimitado' : tenant.maxUsers}
                      </div>
                      <div>
                        <span className="font-medium">Lojas:</span> {tenant.maxStores === -1 ? 'Ilimitado' : tenant.maxStores}
                      </div>
                      {tenant.trialEndsAt && (
                        <div>
                          <span className="font-medium">Trial expira em:</span> {tenant.trialEndsAt.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
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
