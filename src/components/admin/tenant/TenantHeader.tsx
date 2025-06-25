
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Play, Pause } from "lucide-react";
import { Tenant } from "@/lib/saas-schema";

interface TenantHeaderProps {
  tenant: Tenant;
  onNavigateBack: () => void;
}

export function TenantHeader({ tenant, onNavigateBack }: TenantHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onNavigateBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-gray-600 mt-1">Detalhes do inquilino</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button variant="outline">
          {tenant.status === 'active' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {tenant.status === 'active' ? 'Suspender' : 'Ativar'}
        </Button>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
