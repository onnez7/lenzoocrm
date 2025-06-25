
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, DollarSign } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  totalSold: number;
  revenue: number;
  growth: number;
}

interface BestSellingProductsProps {
  tenantId: string;
  tenantName: string;
}

export function BestSellingProducts({ tenantId, tenantName }: BestSellingProductsProps) {
  // Mock data - would come from API in real implementation
  const bestSellingProducts: Product[] = [
    {
      id: "1",
      name: "Óculos Ray-Ban Aviador",
      brand: "Ray-Ban",
      category: "Óculos de Sol",
      totalSold: 145,
      revenue: 28900.00,
      growth: 15.2
    },
    {
      id: "2", 
      name: "Lente de Contato Biofinity",
      brand: "CooperVision",
      category: "Lentes de Contato",
      totalSold: 98,
      revenue: 9800.00,
      growth: 8.7
    },
    {
      id: "3",
      name: "Armação Oakley Holbrook",
      brand: "Oakley",
      category: "Armações",
      totalSold: 76,
      revenue: 15200.00,
      growth: -2.1
    },
    {
      id: "4",
      name: "Óculos Progressive Zeiss",
      brand: "Zeiss",
      category: "Lentes Progressivas",
      totalSold: 62,
      revenue: 31000.00,
      growth: 22.5
    },
    {
      id: "5",
      name: "Kit Limpeza Premium",
      brand: "Lenzoo",
      category: "Kit de Produtos",
      totalSold: 203,
      revenue: 4060.00,
      growth: 35.8
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) return "bg-green-100 text-green-800";
    if (growth < 0) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Produtos Mais Vendidos
        </CardTitle>
        <CardDescription>
          Top 5 produtos por volume de vendas nos últimos 30 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bestSellingProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{product.brand}</span>
                    <span>•</span>
                    <span>{product.category}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    {product.totalSold} vendas
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
                
                <Badge className={getGrowthBadge(product.growth)}>
                  {product.growth > 0 ? '+' : ''}{product.growth.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {bestSellingProducts.reduce((sum, p) => sum + p.totalSold, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Vendas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(bestSellingProducts.reduce((sum, p) => sum + p.revenue, 0))}
              </div>
              <div className="text-sm text-gray-600">Receita Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(bestSellingProducts.reduce((sum, p) => sum + p.growth, 0) / bestSellingProducts.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Crescimento Médio</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
