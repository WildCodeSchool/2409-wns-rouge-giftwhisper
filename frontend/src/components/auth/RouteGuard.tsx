import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Composant de loading simple pendant l'initialisation
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Vérification de l'authentification...</p>
    </div>
  </div>
);

// Protection pour les routes qui nécessitent une authentification
export const ProtectedLayout = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  
  // Afficher le loading pendant l'initialisation
  if (isInitializing) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return <Outlet />;
}

// Protection pour les routes qui ne devraient être accessibles que lorsque l'utilisateur n'est PAS authentifié
export const PublicOnlyLayout = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  
  // Afficher le loading pendant l'initialisation
  if (isInitializing) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
} 