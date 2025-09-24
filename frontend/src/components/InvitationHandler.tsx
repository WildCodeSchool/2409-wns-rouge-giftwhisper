import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Composant qui intercepte les liens d'invitation sur la route /invitation/:token
 */
const InvitationHandler = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { handleInvitationToken, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!token) {
      toast.error("Aucun token d'invitation trouvé");
      navigate('/');
      return;
    }

    //Persister le token dans l'auth context
    handleInvitationToken(token);

    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/sign-in', { replace: true });
    }

  }, [token, navigate, handleInvitationToken, isAuthenticated]);

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-lg">Traitement de votre invitation...</p>
    </div>
  );
};

export default InvitationHandler; 