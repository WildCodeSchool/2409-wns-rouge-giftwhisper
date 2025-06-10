import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Protection pour les routes qui nécessitent une authentification
export const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return <Outlet />;
}

// Protection pour les routes qui ne devraient être accessibles que lorsque l'utilisateur n'est PAS authentifié
export const PublicOnlyLayout = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
} 