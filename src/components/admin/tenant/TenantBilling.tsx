
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TenantBilling() {
  const mockBilling = [
    {
      id: '1',
      date: '2024-06-01',
      amount: 199.90,
      status: 'paid',
      description: 'Plano Premium - Junho 2024',
    },
    {
      id: '2',
      date: '2024-05-01',
      amount: 199.90,
      status: 'paid',
      description: 'Plano Premium - Maio 2024',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Faturamento</CardTitle>
        <CardDescription>Últimas transações e pagamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockBilling.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{bill.description}</div>
                <div className="text-sm text-gray-600">{new Date(bill.date).toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">R$ {bill.amount.toFixed(2)}</div>
                <div className="text-sm">
                  <Badge className="bg-green-100 text-green-800">Pago</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
