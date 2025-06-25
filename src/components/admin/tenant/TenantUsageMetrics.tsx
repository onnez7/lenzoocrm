
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TenantUsageMetrics() {
  const mockUsage = {
    users: 3,
    stores: 1,
    invoices: 127,
    products: 850,
    storage: 245, // MB
    apiCalls: 1240,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso Atual</CardTitle>
        <CardDescription>Métricas de uso do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{mockUsage.users}</div>
            <div className="text-sm text-gray-600">Usuários</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">{mockUsage.stores}</div>
            <div className="text-sm text-gray-600">Lojas</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{mockUsage.invoices}</div>
            <div className="text-sm text-gray-600">Faturas</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{mockUsage.products}</div>
            <div className="text-sm text-gray-600">Produtos</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-red-600">{mockUsage.storage}</div>
            <div className="text-sm text-gray-600">MB Storage</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{mockUsage.apiCalls}</div>
            <div className="text-sm text-gray-600">API Calls</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
