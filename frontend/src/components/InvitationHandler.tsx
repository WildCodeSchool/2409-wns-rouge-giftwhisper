import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Fonction pour vérifier si l'utilisateur est connecté
// À adapter selon votre système d'authentification
const isAuthenticated = () => {
  // Vérifiez ici si l'utilisateur est connecté
  // Par exemple, en vérifiant un token dans localStorage
  return localStorage.getItem('authToken') !== null;
};

const InvitationHandler = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      // Si pas de token, rediriger vers la page d'accueil
      navigate('/');
      return;
    }

    // Stocker le token d'invitation dans localStorage
    localStorage.setItem('invitationToken', token);

    // Rediriger selon l'état d'authentification
    if (isAuthenticated()) {
      // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
      // avec un paramètre pour indiquer qu'une invitation est en attente
      navigate('/dashboard?invitation=pending');
    } else {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      // avec un paramètre pour indiquer qu'une invitation est en attente
      navigate('/sign-in?invitation=pending');
    }
  }, [token, navigate]);

  // Afficher un message de chargement pendant la redirection
  return (
    <div className="flex justify-center items-center h-screen">
      <p>Traitement de votre invitation...</p>
    </div>
  );
};

export default InvitationHandler; 