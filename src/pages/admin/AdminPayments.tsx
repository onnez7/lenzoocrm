
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPayments() {
  const mockPayments = [
    {
      id: '1',
      tenant: 'Ótica Visão Clara',
      amount: 199.90,
      status: 'succeeded',
      date: '2024-06-15',
      method: 'Cartão de Crédito',
    },
    {
      id: '2',
      tenant: 'Ótica Moderna',
      amount: 99.90,
      status: 'succeeded',
      date: '2024-06-10',
      method: 'PIX',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
        <p className="text-gray-600 mt-2">Histórico de transações financeiras</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimos pagamentos processados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPayments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{payment.tenant}</h3>
                    <p className="text-sm text-gray-600">
                      {payment.method} - {new Date(payment.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R$ {payment.amount.toFixed(2)}</div>
                    <Badge className="bg-green-100 text-green-800">
                      Aprovado
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
