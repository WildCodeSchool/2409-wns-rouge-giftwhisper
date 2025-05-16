import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { saveInvitationToken } from '@/utils/helpers/InvitationManager';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';

/**
 * Composant qui intercepte les liens d'invitation sur la route /invitation/:token
 */
const InvitationHandler = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { handleInvitationToken } = useNavigationFlow();

  useEffect(() => {
    if (!token) {
      toast.error("Aucun token d'invitation trouvé");
      navigate('/');
      return;
    }

    saveInvitationToken(token);
    
    handleInvitationToken(token);
  }, [token, navigate, handleInvitationToken]);

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-lg">Traitement de votre invitation...</p>
    </div>
  );
};

export default InvitationHandler; 