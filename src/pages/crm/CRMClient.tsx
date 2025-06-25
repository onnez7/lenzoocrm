
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CRMClient = () => {
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
          <CardTitle>Detalhes CRM</CardTitle>
          <CardDescription>
            Em desenvolvimento...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMClient;
