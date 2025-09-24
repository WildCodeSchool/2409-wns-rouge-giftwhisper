import { useMutation, useApolloClient } from "@apollo/client";
import { DELETE_ACCOUNT } from "@/api/user";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useDeleteAccount() {
  const [deleteAccount, { loading }] = useMutation(DELETE_ACCOUNT);
  const client = useApolloClient();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await client.resetStore();
      toast.success("Votre compte a été supprimé avec succès");
      navigate("/sign-in");
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression du compte", {
        description: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  return { handleDeleteAccount, loading };
}
