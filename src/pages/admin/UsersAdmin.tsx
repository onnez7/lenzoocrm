import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit, Trash2, Search, Users, Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/config/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'FRANCHISE_ADMIN' | 'EMPLOYEE';
  franchise_id: number | null;
  franchise_name?: string;
  created_at: string;
}

interface Franchise {
  id: number;
  name: string;
  cnpj: string;
}

const UsersAdmin = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'EMPLOYEE', 
    franchiseId: '' 
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

  // Buscar usuários e franquias
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar usuários
        const usersRes = await fetch(apiUrl('/users'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Buscar franquias
        const franchisesRes = await fetch(apiUrl('/franchises'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const franchisesData = await franchisesRes.json();
        setFranchises(franchisesData);
      } catch (err) {
        toast({ title: 'Erro', description: 'Erro ao buscar dados', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, toast]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.franchise_name && u.franchise_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers para criar usuário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setForm({ ...form, role: value as 'EMPLOYEE' | 'FRANCHISE_ADMIN' });
  };

  const handleFranchiseChange = (value: string) => {
    setForm({ ...form, franchiseId: value });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.password) {
      toast({ 
        title: 'Erro', 
        description: 'Preencha todos os campos obrigatórios', 
        variant: 'destructive' 
      });
      return;
    }

    if (form.role === 'FRANCHISE_ADMIN' && !form.franchiseId) {
      toast({ 
        title: 'Erro', 
        description: 'Admin de franquia deve estar associado a uma franquia', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        userRole: form.role,
        targetFranchiseId: form.franchiseId ? Number(form.franchiseId) : null
      };

      const res = await fetch(apiUrl('/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const error = await res.json();
        toast({ 
          title: 'Erro', 
          description: error.message || 'Erro ao criar usuário', 
          variant: 'destructive' 
        });
        return;
      }

      const newUser = await res.json();
      toast({ 
        title: 'Sucesso', 
        description: 'Usuário criado com sucesso!' 
      });
      
      setOpen(false);
      setForm({ name: '', email: '', password: '', role: 'EMPLOYEE', franchiseId: '' });
      
      // Atualiza lista
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao criar usuário', 
        variant: 'destructive' 
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Admin Matriz';
      case 'FRANCHISE_ADMIN': return 'Admin Franquia';
      case 'EMPLOYEE': return 'Funcionário';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'default';
      case 'FRANCHISE_ADMIN': return 'secondary';
      case 'EMPLOYEE': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Usuário</DialogTitle>
              <DialogDescription>Preencha os dados para criar um novo usuário.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 py-4" onSubmit={handleCreateUser}>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={form.name} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={form.email} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Senha *</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={form.password} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Perfil *</Label>
                <Select value={form.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Funcionário</SelectItem>
                    <SelectItem value="FRANCHISE_ADMIN">Admin Franquia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="franchise" className="text-right">Franquia</Label>
                <Select value={form.franchiseId} onValueChange={handleFranchiseChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a franquia (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem franquia</SelectItem>
                    {franchises.map((franchise) => (
                      <SelectItem key={franchise.id} value={franchise.id.toString()}>
                        {franchise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Usuário</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou franquia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários ({filteredUsers.length})
          </CardTitle>
          <CardDescription>Gerencie os usuários cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Carregando usuários...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Franquia</TableHead>
                  <TableHead>Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(u.role) as any}>
                          {getRoleLabel(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.franchise_name ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {u.franchise_name}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersAdmin; 