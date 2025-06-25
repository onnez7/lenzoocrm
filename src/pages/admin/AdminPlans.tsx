
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPlans } from "@/lib/saas-schema";
import { Plus, Edit } from "lucide-react";

export default function AdminPlans() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos</h1>
          <p className="text-gray-600 mt-2">Configure os planos disponíveis</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockPlans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    R$ {plan.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">por mês</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Usuários:</strong> {plan.maxUsers === -1 ? 'Ilimitado' : plan.maxUsers}
                  </div>
                  <div className="text-sm">
                    <strong>Lojas:</strong> {plan.maxStores === -1 ? 'Ilimitado' : plan.maxStores}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recursos:</h4>
                  <ul className="text-sm space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
