import { useNavigate} from "react-router-dom";
import { useCurrentUser } from "./currentUser";
import { toast } from "sonner";
import { getInvitationToken } from "@/utils/helpers/InvitationManager";

/**
 * Hook pour centraliser la gestion des flux de navigation dans l'application
 */
export const useNavigationFlow = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  // Redirection après authentification réussie
  const handlePostAuthRedirection = () => {
    // On check si on a une invitation en attente
    const invitationToken = getInvitationToken();
    console.log("invitationToken", invitationToken);
    if (invitationToken) {
      // Si nous avons un token d'invitation, aller au dashboard avec le paramètre
      navigate("/dashboard?invitation=pending", { replace: true });
      return true;
    } else {
      // Par défaut, rediriger vers le dashboard
      navigate("/dashboard", { replace: true });
      return true;
    }
  };

  // Traitement d'un token d'invitation
  const handleInvitationToken = (token: string) => {
    if (!token) return;

    if (user === undefined) {
      // L'état d'authentification n'est pas encore chargé
      // On sauvegarde quand même le token pour plus tard
      return;
    }

    if (user === null) {
      // Utilisateur non connecté, on redirige vers la page de connexion
      toast.info("Veuillez vous connecter pour rejoindre le groupe");
      navigate("/sign-in");
    } else {
      // Utilisateur connecté, on redirige vers le dashboard avec l'invitation
      navigate("/dashboard?invitation=pending", { replace: true });
    }
  };

  // Redirection vers la page de connexion
  const redirectToLogin = (options?: { 
    message?: string; 
    redirectAfterAuth?: string;
  }) => {
    const message = options?.message || "Veuillez vous connecter pour continuer";
    toast.info(message);
    navigate("/sign-in", {
      state: { 
        redirectAfterAuth: options?.redirectAfterAuth || "/dashboard"
      }
    });
  };

  // Redirection vers la page d'inscription
  const redirectToSignup = (options?: {
    message?: string;
    redirectAfterAuth?: string;
  }) => {
    const message = options?.message || "Veuillez vous inscrire pour continuer";
    toast.info(message);
    navigate("/sign-up", {
      state: {
        redirectAfterAuth: options?.redirectAfterAuth || "/dashboard"
      }
    });
  };

  // Redirection vers le dashboard
  const redirectToDashboard = (replace = true) => {
    navigate("/dashboard", { replace });
  };

  // Redirection vers le groupe
  const redirectToGroup = (groupId: string) => {
    navigate(`/group?id=${groupId}`);
  };

  return {
    handlePostAuthRedirection,
    handleInvitationToken,
    redirectToLogin,
    redirectToSignup,
    redirectToDashboard,
    redirectToGroup
  };
};