
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AdminBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbMap: Record<string, string> = {
    'admin': 'Dashboard',
    'tenants': 'Inquilinos',
    'subscriptions': 'Assinaturas',
    'plans': 'Planos',
    'payments': 'Pagamentos',
    'usage': 'Uso & Métricas',
    'settings': 'Configurações'
  };

  const getBreadcrumbName = (segment: string, index: number) => {
    if (breadcrumbMap[segment]) {
      return breadcrumbMap[segment];
    }
    
    // Se for um ID (números), tentamos dar um nome mais amigável
    if (/^\d+$/.test(segment) && pathSegments[index - 1] === 'tenants') {
      return 'Detalhes do Inquilino';
    }
    
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const buildPath = (index: number) => {
    return '/' + pathSegments.slice(0, index + 1).join('/');
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link 
        to="/admin" 
        className="flex items-center hover:text-red-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathSegments.length > 1 && (
        <>
          <ChevronRight className="h-4 w-4" />
          {pathSegments.slice(1).map((segment, index) => {
            const actualIndex = index + 1;
            const isLast = actualIndex === pathSegments.length - 1;
            const path = buildPath(actualIndex);
            
            if (isLast) {
              return (
                <span key={segment} className="font-medium text-gray-900">
                  {getBreadcrumbName(segment, actualIndex)}
                </span>
              );
            }
            
            return (
              <div key={segment} className="flex items-center space-x-2">
                <Link 
                  to={path} 
                  className="hover:text-red-600 transition-colors"
                >
                  {getBreadcrumbName(segment, actualIndex)}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </div>
            );
          })}
        </>
      )}
    </nav>
  );
}
