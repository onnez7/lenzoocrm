
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Bell, 
  CreditCard, 
  FileText,
  Settings,
  Download
} from "lucide-react";

const quickActions = [
  {
    title: "Novo Franqueado",
    description: "Cadastrar novo franqueado",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    action: () => console.log("Novo franqueado")
  },
  {
    title: "Relatório Financeiro",
    description: "Gerar relatório completo",
    icon: TrendingUp,
    color: "text-green-600", 
    bgColor: "bg-green-100",
    action: () => console.log("Relatório financeiro")
  },
  {
    title: "Ver Tickets",
    description: "Central de suporte",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100", 
    action: () => console.log("Ver tickets")
  },
  {
    title: "Configurações",
    description: "Ajustes do sistema",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    action: () => console.log("Configurações")
  },
  {
    title: "Cobrança Manual",
    description: "Processar pagamento",
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    action: () => console.log("Cobrança manual")
  },
  {
    title: "Exportar Dados",
    description: "Download planilhas",
    icon: Download,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    action: () => console.log("Exportar dados")
  },
  {
    title: "Notificações",
    description: "Enviar comunicados",
    icon: Bell,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    action: () => console.log("Notificações")
  },
  {
    title: "Contratos",
    description: "Gestão de contratos",
    icon: FileText,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    action: () => console.log("Contratos")
  }
];

export function AdminQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Acesso rápido às principais funcionalidades administrativas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-24 flex-col p-4 hover:shadow-md transition-all"
              onClick={action.action}
            >
              <div className={`p-2 rounded-lg ${action.bgColor} mb-2`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <span className="text-sm font-medium text-center">{action.title}</span>
              <span className="text-xs text-gray-500 text-center mt-1">{action.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
