import { useMutation, useApolloClient } from "@apollo/client";
import { LOGOUT } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useLogout() {
  const [logout, { loading }] = useMutation(LOGOUT);
  const client = useApolloClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.data?.logout) {
        await client.resetStore();
        toast.success("Vous êtes déconnecté");
        navigate("/sign-in");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la déconnexion", {
        description: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  return { handleLogout, loading };
}
