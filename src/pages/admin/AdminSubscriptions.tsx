
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTenants } from "@/lib/saas-schema";

export default function AdminSubscriptions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assinaturas</h1>
        <p className="text-gray-600 mt-2">Gerencie todas as assinaturas ativas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Assinaturas</CardTitle>
          <CardDescription>Assinaturas ativas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTenants.map((tenant) => (
              <div key={tenant.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{tenant.name}</h3>
                    <p className="text-sm text-gray-600">Plano {tenant.plan}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      tenant.status === 'active' 
                        ? "bg-green-100 text-green-800"
                        : tenant.status === 'trial'
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }>
                      {tenant.status === 'active' ? 'Ativa' : tenant.status === 'trial' ? 'Trial' : 'Inativa'}
                    </Badge>
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
