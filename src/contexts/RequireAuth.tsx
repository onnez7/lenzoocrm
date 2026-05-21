import { useAuth } from "./AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // ou um spinner

  if (!user) {
    // Redireciona para login, mantendo a rota original
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 