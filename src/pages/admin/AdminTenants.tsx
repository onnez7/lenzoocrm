import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Eye, Edit, Trash2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/config/api";

interface Franchise {
  id: number;
  name: string;
  address: string;
  status: string;
  created_at: string;
  phone?: string;
  email?: string;
  cnpj?: string;
  city?: string;
  state?: string;
}

export default function AdminTenants() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    status: 'active',
    cnpj: '',
    email: '',
    phone: '',
    city: '',
    state: ''
  });
  const { toast } = useToast();

  // Verificar se o usuário é SUPER_ADMIN
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      toast({ 
        title: 'Acesso Negado', 
        description: 'Apenas administradores matriz podem acessar esta área.', 
        variant: 'destructive' 
      });
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);

  // Se não for SUPER_ADMIN, não renderiza nada
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  // Buscar franquias
  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl('/franchises'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error('Erro ao buscar franquias');
        }
        
        const data = await res.json();
        setFranchises(data);
      } catch (err) {
        toast({ 
          title: 'Erro', 
          description: 'Erro ao buscar franquias', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFranchises();
  }, [token, toast]);

  const filteredFranchises = franchises.filter(franchise =>
    franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (franchise.address && franchise.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (franchise.email && franchise.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-orange-100 text-orange-800",
    };
    
    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente",
      suspended: "Suspenso",
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleCreateFranchise = () => {
    // TODO: Implementar modal de criação de franquia
    toast({ 
      title: 'Funcionalidade em desenvolvimento', 
      description: 'Criação de franquias será implementada em breve' 
    });
  };

  const handleEditFranchise = (franchise: Franchise) => {
    setEditingFranchise(franchise);
    setEditForm({
      name: franchise.name,
      address: franchise.address || '',
      status: franchise.status,
      cnpj: franchise.cnpj || '',
      email: franchise.email || '',
      phone: franchise.phone || '',
      city: franchise.city || '',
      state: franchise.state || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFranchise) return;

    try {
      const updateData = {
        name: editForm.name,
        address: editForm.address,
        status: editForm.status,
        cnpj: editForm.cnpj,
        email: editForm.email,
        phone: editForm.phone,
        city: editForm.city,
        state: editForm.state
      };

      const res = await fetch(apiUrl(`/franchises/${editingFranchise.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao atualizar franquia');
      }

      const updatedFranchise = await res.json();
      
      // Atualizar a lista local
      setFranchises(prev => prev.map(f => 
        f.id === editingFranchise.id ? updatedFranchise : f
      ));

      toast({ 
        title: 'Sucesso', 
        description: 'Franquia atualizada com sucesso!' 
      });
      
      setEditDialogOpen(false);
      setEditingFranchise(null);
    } catch (err) {
      toast({ 
        title: 'Erro', 
        description: err instanceof Error ? err.message : 'Erro ao atualizar franquia', 
        variant: 'destructive' 
      });
    }
  };

  const handleDeleteFranchise = async (franchiseId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta franquia? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const res = await fetch(apiUrl(`/franchises/${franchiseId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao excluir franquia');
      }

      // Remover da lista local
      setFranchises(prev => prev.filter(f => f.id !== franchiseId));

      toast({ 
        title: 'Sucesso', 
        description: 'Franquia excluída com sucesso!' 
      });
    } catch (err) {
      toast({ 
        title: 'Erro', 
        description: err instanceof Error ? err.message : 'Erro ao excluir franquia', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Franquias</h1>
          <p className="text-gray-600 mt-2">Gerencie todas as franquias do sistema</p>
        </div>
        <Button onClick={handleCreateFranchise}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Franquia
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, endereço ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Franchises List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Lista de Franquias
          </CardTitle>
          <CardDescription>
            {loading ? 'Carregando...' : `${filteredFranchises.length} franquia(s) encontrada(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Carregando franquias...</p>
            </div>
          ) : filteredFranchises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>Nenhuma franquia encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFranchises.map((franchise) => (
                <div key={franchise.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{franchise.name}</h3>
                        {getStatusBadge(franchise.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Endereço:</span> {franchise.address || 'Não informado'}
                        </div>
                        <div>
                          <span className="font-medium">Criado em:</span> {new Date(franchise.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {franchise.cnpj && (
                          <div>
                            <span className="font-medium">CNPJ:</span> {franchise.cnpj}
                          </div>
                        )}
                        {franchise.email && (
                          <div>
                            <span className="font-medium">Email:</span> {franchise.email}
                          </div>
                        )}
                        {franchise.phone && (
                          <div>
                            <span className="font-medium">Telefone:</span> {franchise.phone}
                          </div>
                        )}
                        {franchise.city && (
                          <div>
                            <span className="font-medium">Cidade:</span> {franchise.city}
                          </div>
                        )}
                        {franchise.state && (
                          <div>
                            <span className="font-medium">Estado:</span> {franchise.state}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/tenants/${franchise.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditFranchise(franchise)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteFranchise(franchise.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Franquia</DialogTitle>
            <DialogDescription>
              Atualize as informações da franquia {editingFranchise?.name}
            </DialogDescription>
          </DialogHeader>
          <form className="flex-1 gap-4 py-4" onSubmit={handleUpdateFranchise}>
            <div className="items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome *</Label>
              <Input id="name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="col-span-3" required />
            </div>
            
            <div className="items-center gap-4">
              <Label htmlFor="address" className="text-right">Endereço</Label>
              <Input id="address" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="col-span-3" />
            </div>
            
            <div className="items-center gap-4">
              <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
              <Input id="cnpj" value={editForm.cnpj} onChange={(e) => setEditForm({...editForm, cnpj: e.target.value})} className="col-span-3" />
            </div>
            
            <div className="items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="col-span-3" />
            </div>
            
            <div className="items-center gap-4">
              <Label htmlFor="phone" className="text-right">Telefone</Label>
              <Input id="phone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="col-span-3" />
            </div>
            
            <div className="items-center gap-4">
              <Label htmlFor="city" className="text-right">Cidade</Label>
              <Input id="city" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} className="col-span-3" />
            </div>
            
            <div className="items-center gap-4">
              <Label htmlFor="state" className="text-right">Estado</Label>
              <Input id="state" value={editForm.state} onChange={(e) => setEditForm({...editForm, state: e.target.value})} className="col-span-3" />
            </div>
            
            <div className="items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
