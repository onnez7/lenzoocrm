import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import productService, { Product, CreateProductData } from "@/services/productService";
import categoryService, { Category } from "@/services/categoryService";
import brandService, { Brand } from "@/services/brandService";
import { useAuth } from "@/contexts/AuthContext";

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    stock_quantity: 0,
    min_stock: 0,
    category_id: undefined,
    brand_id: undefined,
    sku: "",
    model: "",
    barcode: "",
  });

  // Carregar categorias e marcas
  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  // Carregar produto para edição
  useEffect(() => {
    if (isEdit && id) {
      loadProduct();
    }
  }, [isEdit, id]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      let categoriesData: Category[];
      
      if (user?.role === 'FRANCHISE_ADMIN') {
        categoriesData = await categoryService.getFranchiseCategories();
      } else {
        categoriesData = await categoryService.getCategories();
      }
      
      setCategories(categoriesData.filter(cat => cat.is_active));
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadBrands = async () => {
    try {
      setLoadingBrands(true);
      let brandsData: Brand[];
      
      if (user?.role === 'FRANCHISE_ADMIN') {
        brandsData = await brandService.getFranchiseBrands();
      } else {
        brandsData = await brandService.getBrands();
      }
      
      setBrands(brandsData.filter(brand => brand.is_active));
    } catch (error: any) {
      console.error('Erro ao carregar marcas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar marcas",
        variant: "destructive",
      });
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      let product: Product;
      
      if (user?.role === 'FRANCHISE_ADMIN') {
        product = await productService.getFranchiseProductById(parseInt(id));
      } else {
        product = await productService.getProductById(parseInt(id));
      }
      
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        cost: product.cost || 0,
        stock_quantity: product.stock_quantity,
        min_stock: product.min_stock,
        category_id: product.category_id || undefined,
        brand_id: product.brand_id || undefined,
        sku: product.sku || "",
        model: product.model || "",
        barcode: product.barcode || "",
      });
    } catch (error: any) {
      console.error('Erro ao carregar produto:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao carregar produto",
        variant: "destructive",
      });
      navigate("/products");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.price) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit && id) {
        // Atualizar produto
        if (user?.role === 'FRANCHISE_ADMIN') {
          await productService.updateFranchiseProduct(parseInt(id), formData);
        } else {
          await productService.updateProduct(parseInt(id), formData);
        }
        
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!",
        });
      } else {
        // Criar novo produto
        if (user?.role === 'FRANCHISE_ADMIN') {
          await productService.createFranchiseProduct(formData);
        } else {
          // Para SUPER_ADMIN, precisamos especificar a franquia
          if (!formData.targetFranchiseId) {
            toast({
              title: "Erro",
              description: "Franquia deve ser especificada para SUPER_ADMIN.",
              variant: "destructive",
            });
            return;
          }
          await productService.createProduct(formData);
        }
        
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso!",
        });
      }

      navigate("/products");
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingProduct || loadingCategories || loadingBrands) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

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
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Edite as informações do produto" : "Cadastre um novo produto"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações do Produto
            </CardTitle>
            <CardDescription>
              Preencha as informações básicas do produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Óculos Ray-Ban Aviador"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="Ex: RB3025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category_id?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("category_id", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Select 
                  value={formData.brand_id?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("brand_id", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Ex: RB3025-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  placeholder="Ex: 7891234567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva as características do produto..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço de Venda *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Preço de Custo</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Estoque Atual</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange("stock_quantity", parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock">Estoque Mínimo</Label>
                <Input
                  id="min_stock"
                  type="number"
                  min="0"
                  value={formData.min_stock}
                  onChange={(e) => handleInputChange("min_stock", parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEdit ? "Atualizar" : "Salvar"} Produto
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ProductForm;
