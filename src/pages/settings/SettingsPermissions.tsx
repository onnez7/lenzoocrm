import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Settings, Eye, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import employeeService, { Role } from "@/services/employeeService";

interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface RoleWithPermissions extends Role {
  permissions: Permission[];
  employeeCount: number;
}

const modules = [
  { key: 'dashboard', name: 'Dashboard' },
  { key: 'clients', name: 'Clientes' },
  { key: 'products', name: 'Produtos' },
  { key: 'stock', name: 'Estoque' },
  { key: 'orders', name: 'Ordens de Serviço' },
  { key: 'appointments', name: 'Agendamentos' },
  { key: 'automation', name: 'Automação' },
  { key: 'cashier', name: 'Caixa' },
  { key: 'crm', name: 'CRM' },
  { key: 'finance', name: 'Financeiro' },
  { key: 'employees', name: 'Funcionários' },
  { key: 'user_profile', name: 'Perfil de Usuário' },
  { key: 'user_settings', name: 'Configurações de Usuário' },
  { key: 'settings', name: 'Configurações do Sistema' },
];

const SettingsPermissions = () => {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const { toast } = useToast();

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await employeeService.getRoles();
      
      // Converter para o formato com permissões
      const rolesWithPermissions: RoleWithPermissions[] = rolesData.map(role => ({
        ...role,
        employeeCount: 0, // TODO: Implementar contagem de funcionários
        permissions: modules.map(module => ({
          module: module.key,
          view: true, // TODO: Implementar permissões reais
          create: ['dashboard', 'settings'].includes(module.key) ? false : true,
          edit: ['dashboard', 'settings'].includes(module.key) ? false : true,
          delete: ['clients', 'products', 'appointments', 'orders'].includes(module.key)
        }))
      }));
      
      setRoles(rolesWithPermissions);
      if (rolesWithPermissions.length > 0 && !selectedRole) {
        setSelectedRole(rolesWithPermissions[0].id.toString());
      }
    } catch (error: any) {
      console.error('Erro ao carregar cargos:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao carregar cargos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const currentRole = roles.find(role => role.id.toString() === selectedRole);

  const handlePermissionChange = (moduleKey: string, action: keyof Permission, value: boolean) => {
    setRoles(prev => prev.map(role => 
      role.id.toString() === selectedRole
        ? {
            ...role,
            permissions: role.permissions.map(perm => 
              perm.module === moduleKey
                ? { ...perm, [action]: value }
                : perm
            )
          }
        : role
    ));
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      // TODO: Implementar salvamento real das permissões
      toast({
        title: "Permissões salvas",
        description: "As permissões foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao salvar permissões:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar permissões",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const createNewRole = () => {
    const newRole: RoleWithPermissions = {
      id: Date.now(),
      name: "Novo Cargo",
      description: "Descrição do novo cargo",
      is_active: true,
      employeeCount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      permissions: modules.map(module => ({
        module: module.key,
        view: false,
        create: false,
        edit: false,
        delete: false
      }))
    };
    
    setRoles(prev => [...prev, newRole]);
    setSelectedRole(newRole.id.toString());
  };

  const deleteRole = (roleId: string) => {
    setRoles(prev => prev.filter(role => role.id.toString() !== roleId));
    if (selectedRole === roleId) {
      setSelectedRole(roles[0]?.id.toString() || "");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando permissões...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permissões</h1>
          <p className="text-muted-foreground">
            Configure permissões por cargo e funcionário
          </p>
        </div>
        
        <Button onClick={createNewRole}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Cargos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cargos
            </CardTitle>
            <CardDescription>
              Selecione um cargo para editar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRole === role.id.toString() 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRole(role.id.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.employeeCount} funcionários
                      </div>
                    </div>
                    <Badge variant={role.is_active ? "default" : "secondary"}>
                      {role.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuração de Permissões */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissões - {currentRole?.name}
            </CardTitle>
            <CardDescription>
              {currentRole?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentRole && (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Módulo</TableHead>
                      <TableHead className="text-center">Visualizar</TableHead>
                      <TableHead className="text-center">Criar</TableHead>
                      <TableHead className="text-center">Editar</TableHead>
                      <TableHead className="text-center">Excluir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((module) => {
                      const permission = currentRole.permissions.find(p => p.module === module.key);
                      if (!permission) return null;

                      return (
                        <TableRow key={module.key}>
                          <TableCell className="font-medium">
                            {module.name}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.view}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.key, 'view', checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.create}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.key, 'create', checked)
                              }
                              disabled={!permission.view}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.edit}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.key, 'edit', checked)
                              }
                              disabled={!permission.view}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.delete}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.key, 'delete', checked)
                              }
                              disabled={!permission.view}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <Separator />

                <div className="flex justify-between">
                  <div className="space-x-2">
                    {currentRole.employeeCount === 0 && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteRole(currentRole.id.toString())}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Cargo
                      </Button>
                    )}
                  </div>
                  
                  <Button onClick={savePermissions} disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Settings className="mr-2 h-4 w-4" />
                    )}
                    Salvar Permissões
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Cargo</CardTitle>
          <CardDescription>
            Visão geral das permissões configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>Funcionários</TableHead>
                <TableHead>Módulos com Acesso</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const accessibleModules = role.permissions.filter(p => p.view).length;
                const fullAccessModules = role.permissions.filter(p => p.view && p.create && p.edit && p.delete).length;
                
                let accessLevel = "Básico";
                if (fullAccessModules === modules.length) accessLevel = "Total";
                else if (fullAccessModules > modules.length / 2) accessLevel = "Avançado";
                else if (accessibleModules > modules.length / 2) accessLevel = "Intermediário";

                return (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {role.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{role.employeeCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {accessibleModules}/{modules.length} módulos
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          accessLevel === "Total" ? "default" :
                          accessLevel === "Avançado" ? "secondary" : "outline"
                        }
                      >
                        {accessLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.is_active ? "default" : "secondary"}>
                        {role.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPermissions;
