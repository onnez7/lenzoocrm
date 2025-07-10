import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/config/api";
import { BestSellingProducts } from "@/components/admin/BestSellingProducts";
import { TenantHeader } from "@/components/admin/tenant/TenantHeader";
import { TenantBasicInfo } from "@/components/admin/tenant/TenantBasicInfo";
import { TenantUsageMetrics } from "@/components/admin/tenant/TenantUsageMetrics";
import { TenantBilling } from "@/components/admin/tenant/TenantBilling";
import { TenantSupport } from "@/components/admin/tenant/TenantSupport";

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

export default function AdminTenantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Buscar dados da franquia
  useEffect(() => {
    const fetchFranchise = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const res = await fetch(apiUrl(`/franchises/${id}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error('Franquia não encontrada');
        }
        
        const data = await res.json();
        setFranchise(data);
      } catch (err) {
        toast({ 
          title: 'Erro', 
          description: 'Erro ao buscar dados da franquia', 
          variant: 'destructive' 
        });
        navigate('/admin/tenants');
      } finally {
        setLoading(false);
      }
    };
    fetchFranchise();
  }, [id, token, toast, navigate]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Carregando dados da franquia...</p>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Franquia não encontrada</h2>
        <Button onClick={() => navigate('/admin/tenants')} className="mt-4">
          Voltar para lista
        </Button>
      </div>
    );
  }

  const handleNavigateBack = () => {
    navigate('/admin/tenants');
  };

  // Converter dados da franquia para o formato esperado pelos componentes
  const tenantData = {
    id: franchise.id.toString(),
    name: franchise.name,
    email: franchise.email || 'Não informado',
    cnpj: franchise.cnpj || 'Não informado',
    phone: franchise.phone || 'Não informado',
    address: franchise.address || 'Não informado',
    city: franchise.city || 'Não informado',
    state: franchise.state || 'Não informado',
    status: franchise.status,
    plan: 'premium', // Valor padrão
    createdAt: new Date(franchise.created_at),
    maxUsers: 10, // Valor padrão
    maxStores: 5, // Valor padrão
    trialEndsAt: null,
    features: [], // Valor padrão
    isActive: franchise.status === 'active',
    updatedAt: new Date(franchise.created_at) // Usar created_at como fallback
  };

  return (
    <div className="space-y-6">
      <TenantHeader tenant={tenantData} onNavigateBack={handleNavigateBack} />
      
      <TenantBasicInfo tenant={tenantData} />

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Uso & Métricas</TabsTrigger>
          <TabsTrigger value="products">Produtos Mais Vendidos</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <TenantUsageMetrics />
        </TabsContent>

        <TabsContent value="products">
          <BestSellingProducts tenantId={franchise.id.toString()} tenantName={franchise.name} />
        </TabsContent>

        <TabsContent value="billing">
          <TenantBilling />
        </TabsContent>

        <TabsContent value="support">
          <TenantSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
