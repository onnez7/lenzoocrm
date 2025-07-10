
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewRule() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Regra de Automação</h1>
          <p className="text-muted-foreground">
            Configure gatilhos e ações para automatizar seu processo de vendas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automação de Vendas</CardTitle>
          <CardDescription>
            Sistema de automação em desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta funcionalidade está sendo desenvolvida e será integrada com o backend em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
