
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const revenueData = [
  { month: 'Jan', revenue: 4200, franchisees: 18 },
  { month: 'Fev', revenue: 4350, franchisees: 19 },
  { month: 'Mar', revenue: 4580, franchisees: 20 },
  { month: 'Abr', revenue: 4720, franchisees: 22 },
  { month: 'Mai', revenue: 4890, franchisees: 23 },
  { month: 'Jun', revenue: 4798, franchisees: 24 },
];

export function AdminRevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Receita Mensal & Crescimento
          <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
            +14% vs último mês
          </span>
        </CardTitle>
        <CardDescription>
          Evolução da receita e número de franqueados ativos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `R$ ${value}` : value,
                  name === 'revenue' ? 'Receita' : 'Franqueados'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="franchisees" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">R$ 4.798</p>
            <p className="text-xs text-gray-500">Receita Atual</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">24</p>
            <p className="text-xs text-gray-500">Franqueados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">R$ 199,92</p>
            <p className="text-xs text-gray-500">Ticket Médio</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
