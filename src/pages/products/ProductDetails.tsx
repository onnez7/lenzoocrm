
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProductDetails = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Detalhes do Produto</h1>
        <p className="text-muted-foreground">
          Visualize informações detalhadas do produto
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
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

export default ProductDetails;
