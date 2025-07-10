import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import brandService, { Brand } from "@/services/brandService";
import { useAuth } from "@/contexts/AuthContext";

const ProductBrands = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);

  const loadBrands = async () => {
    try {
      setLoading(true);
      let brandsData: Brand[];
      
      if (user?.role === 'FRANCHISE_ADMIN') {
        brandsData = await brandService.getFranchiseBrands();
      } else {
        brandsData = await brandService.getBrands();
      }
      
      setBrands(brandsData);
    } catch (error: any) {
      console.error('Erro ao carregar marcas:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao carregar marcas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [user?.role]);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (brand.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingBrand) {
        // Atualizar marca
        if (user?.role === 'FRANCHISE_ADMIN') {
          await brandService.updateFranchiseBrand(editingBrand.id, formData);
        } else {
          await brandService.updateBrand(editingBrand.id, formData);
        }
        
        toast({
          title: "Sucesso",
          description: "Marca atualizada com sucesso!",
        });
      } else {
        // Criar nova marca
        if (user?.role === 'FRANCHISE_ADMIN') {
          await brandService.createFranchiseBrand(formData);
        } else {
          await brandService.createBrand(formData);
        }
        
        toast({
          title: "Sucesso",
          description: "Marca criada com sucesso!",
        });
      }
      
      setFormData({ name: "", description: "" });
      setEditingBrand(null);
      setIsAddDialogOpen(false);
      loadBrands(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao salvar marca:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar marca",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || ""
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta marca?')) {
      return;
    }

    try {
      if (user?.role === 'FRANCHISE_ADMIN') {
        await brandService.deleteFranchiseBrand(id);
      } else {
        await brandService.deleteBrand(id);
      }
      
      toast({
        title: "Sucesso",
        description: "Marca excluída com sucesso",
      });
      
      loadBrands(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao excluir marca:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao excluir marca",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (brand: Brand) => {
    try {
      const updateData = { is_active: !brand.is_active };
      
      if (user?.role === 'FRANCHISE_ADMIN') {
        await brandService.updateFranchiseBrand(brand.id, updateData);
      } else {
        await brandService.updateBrand(brand.id, updateData);
      }
      
      toast({
        title: "Sucesso",
        description: `Marca ${brand.is_active ? 'desativada' : 'ativada'} com sucesso`,
      });
      
      loadBrands(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao alterar status da marca:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao alterar status da marca",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marcas de Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie as marcas dos seus produtos
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingBrand(null);
              setFormData({ name: "", description: "" });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Marca
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "Editar Marca" : "Nova Marca"}
              </DialogTitle>
              <DialogDescription>
                {editingBrand ? "Edite os dados da marca." : "Adicione uma nova marca de produtos."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Marca</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da marca"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da marca"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name.trim() || saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingBrand ? "Salvar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Marcas Cadastradas
          </CardTitle>
          <CardDescription>
            {filteredBrands.length} marcas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando marcas...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {brand.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {brand.products_count || 0} produtos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={brand.is_active ? "default" : "secondary"}>
                          {brand.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(brand.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                            <DropdownMenuItem onClick={() => handleEdit(brand)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(brand)}>
                              {brand.is_active ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(brand.id)}
                              disabled={(brand.products_count || 0) > 0}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredBrands.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Nenhuma marca encontrada</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tente ajustar os termos de busca ou adicione uma nova marca.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductBrands;
