import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import productService, { Product } from "@/services/productService";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      let productData: Product;
      
      if (user?.role === 'FRANCHISE_ADMIN') {
        productData = await productService.getFranchiseProductById(parseInt(id));
      } else {
        productData = await productService.getProductById(parseInt(id));
      }
      
      setProduct(productData);
    } catch (error: any) {
      console.error('Erro ao carregar produto:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao carregar produto",
        variant: "destructive",
      });
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { label: "Sem Estoque", variant: "destructive" as const };
    if (currentStock <= minStock) return { label: "Estoque Baixo", variant: "outline" as const };
    return { label: "Em Estoque", variant: "default" as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando produto...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold">Produto não encontrado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          O produto solicitado não foi encontrado.
        </p>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock_quantity, product.min_stock);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">
            Detalhes do produto
          </p>
        </div>
        <Button onClick={() => navigate(`/products/${product.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>
            
            {product.description && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                <p className="text-sm">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Marca</Label>
                <p className="text-sm">{product.brand_name || "—"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Modelo</Label>
                <p className="text-sm">{product.model || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">SKU</Label>
                <p className="text-sm font-mono">{product.sku || "—"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Código de Barras</Label>
                <p className="text-sm font-mono">{product.barcode || "—"}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
              <p className="text-sm">{product.category_name || "—"}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                {product.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Preços e Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Preços e Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Preço de Venda</Label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(product.price)}
                </p>
              </div>
              {product.cost && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Preço de Custo</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(product.cost)}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status do Estoque</Label>
              <div className="mt-2">
                <Badge variant={stockStatus.variant}>
                  {stockStatus.label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Estoque Atual</Label>
                <p className="text-lg font-semibold">{product.stock_quantity}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Estoque Mínimo</Label>
                <p className="text-sm">{product.min_stock}</p>
              </div>
            </div>

            {product.cost && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Margem de Lucro</Label>
                <p className="text-sm text-green-600">
                  {formatCurrency(product.price - product.cost)} 
                  ({((product.price - product.cost) / product.cost * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações da Franquia */}
        {product.franchise_name && (
          <Card>
            <CardHeader>
              <CardTitle>Franquia</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome da Franquia</Label>
                <p className="text-sm">{product.franchise_name}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle>Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
              <p className="text-sm">{formatDate(product.created_at)}</p>
            </div>
            {product.updated_at && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Última atualização</Label>
                <p className="text-sm">{formatDate(product.updated_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetails;
