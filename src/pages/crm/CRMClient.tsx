import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CRMClient = () => {
  // Exemplo: clientId fixo para demonstração. No real, receberia via props, rota ou contexto.
  const clientId = 1;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM Cliente</h1>
        <p className="text-muted-foreground">
          Histórico e interações com o cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>
            Dados do cliente serão carregados do backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento - integração com backend necessária
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMClient;
